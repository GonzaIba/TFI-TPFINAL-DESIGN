// src/components/forum/SideBarFilters.tsx
"use client";

import { useEffect, useState } from "react";
import { GroupEnum } from "@/lib/types/enum";
import { GroupResponse } from "@/lib/types/forum";
import { filtrosService } from "@/lib/services/forum/filtrosService";
import { Button, InputLabel } from "@/components";
import styles from "./sideBarFilters.module.css";
import CloseIcon from '@mui/icons-material/Close';
import { Colors } from '@/theme/colors'

type SideBarFiltersProps = {
  show?: boolean;
  grupo: GroupEnum;
  closeFunction?: () => Promise<void>;
  resetFunction?: () => Promise<void>;
  saveFunction?: (filters: Record<number, string>) => Promise<void>;
  onCompleted?: () => Promise<void>;
};

export default function SideBarFilters({
  show = false,
  grupo,
  closeFunction,
  resetFunction,
  saveFunction,
  onCompleted,
}: SideBarFiltersProps) {
  const [groupResponse, setGroupResponse] = useState<GroupResponse | null>({
    codeGroup: 0,
    namegroup: "",
    descriptionGroup: "",
    filtersList: [],
  });

  const [filterValues, setFilterValues] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchGroup = async () => {
      const response = await filtrosService.obtenerGrupoConFiltros(grupo);
      setGroupResponse(response);

      const initialFilters: Record<number, string> = {};
      response?.filtersList.forEach((f) => {
        initialFilters[f.codeFilter] = "";
      });
      setFilterValues(initialFilters);
    };

    fetchGroup();
  }, [grupo]);

  const updateFilterValue = (key: number, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const clickCloseFunction = async () => {
    if (closeFunction) await closeFunction();
  };

  const clickSaveFunction = async () => {
    if (saveFunction) await saveFunction(filterValues);
  };

  const clickResetFunction = async () => {
    if (resetFunction) await resetFunction();
  };

  return (
  <>
    <div
      className={`${styles.overlay} ${show ? styles.overlayActive : ''}`}
      onClick={clickCloseFunction}
    />

    <div className={`${styles.sidebarFilters} ${show ? styles.active : ""}`}>
      <div className={styles.sidebarFiltersContainer}>
        <div className={styles.sidebarFiltersPanel}>
          <div className={styles.sidebarFiltersHeadboard}>
            <h3>{groupResponse?.descriptionGroup}</h3>
            <Button
              onClick={clickCloseFunction}
              icon={<CloseIcon sx={{ color: Colors.primary }} fontSize='medium'/>}
              transparent
              width="45px"
            />
          </div>

          <div className="line-div"></div>

          <div className={styles.sidebarFiltersRows}>
            <div className={styles.sidebarFiltersRow}>
              {groupResponse?.filtersList.map((item) => (
                <div className={styles.filterColumn} key={item.codeFilter}>
                  <InputLabel
                    labelText={item.descriptionFilter}
                    inputPlaceHolderText={`Escriba un ${item.descriptionFilter.toLowerCase()} ...`}
                    onInput={(e: { target: { value: string; }; }) =>
                      updateFilterValue(item.codeFilter, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className={styles.sidebarFiltersRow}>
              <div className={styles.filterColumn}>
                <Button
                  onClick={clickSaveFunction}
                  width="100%"
                  text="Guardar Filtros"
                />
              </div>
              <div className={styles.filterColumn}>
                <Button
                  onClick={clickResetFunction}
                  transparent
                  width="100%"
                  text="Restablecer Filtros"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
