// src/components/forum/SideBarFilters.tsx
"use client";

import { useEffect, useState } from "react";
import { GroupEnum, RightBarFilters } from "@/lib/types/enum";
import { GroupResponse } from "@/lib/types/forum";
import { filtrosService } from "@/lib/services/forum/filtrosService";
import InputLabel from "@/components/inputLabelComponent/inputLabel";
import Button from "@/components/buttonComponent/button";
import styles from "./SideBarFilters.module.css";

type SideBarFiltersProps = {
  show?: boolean;
  filter: RightBarFilters;
  grupo: GroupEnum;
  closeFunction?: () => Promise<void>;
  resetFunction?: () => Promise<void>;
  saveFunction?: (filters: Record<number, string>) => Promise<void>;
  onCompleted?: () => Promise<void>;
};

export default function SideBarFilters({
  show = false,
  filter,
  grupo,
  closeFunction,
  resetFunction,
  saveFunction,
  onCompleted,
}: SideBarFiltersProps) {
  const [groupResponse, setGroupResponse] = useState<GroupResponse | null>({
    codigoGrupo: 0,
    nombreGrupo: "",
    descripcionGrupo: "",
    listaFiltros: [],
  });

  const [filterValues, setFilterValues] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchGroup = async () => {
      const response = await filtrosService.obtenerGrupoConFiltros(grupo);
      setGroupResponse(response);

      const initialFilters: Record<number, string> = {};
      response?.listaFiltros.forEach((f) => {
        initialFilters[f.codigoFiltro] = "";
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
    <div className={`${styles.sidebarFilters} ${show ? styles.active : ""}`}>
      <div className={styles.sidebarFiltersContainer}>
        <div className={styles.sidebarFiltersPanel}>
          <div className={styles.sidebarFiltersHeadboard}>
            <h3>{groupResponse?.descripcionGrupo}</h3>
            <Button
              executeFunction={clickCloseFunction}
              iconClass="bx bx-x"
              width="45px"
              bordered
              displayText=""
            />
          </div>

          <div className="line-div"></div>

          <div className={styles.sidebarFiltersRows}>
            <div className={styles.sidebarFiltersRow}>
              {groupResponse?.listaFiltros.map((item) => (
                <div className={styles.filterColumn} key={item.codigoFiltro}>
                  <InputLabel
                    labelText={item.descripcionFiltro}
                    inputPlaceHolderText={`Escriba un ${item.descripcionFiltro.toLowerCase()} ...`}
                    onInput={(e: { target: { value: string; }; }) =>
                      updateFilterValue(item.codigoFiltro, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className={styles.sidebarFiltersRow}>
              <div className={styles.filterColumn}>
                <Button
                  displayText="Guardar Filtros"
                  useExecutingInteraction
                  borderedWithoutRadius
                  executeFunction={clickSaveFunction}
                  useIcon={false}
                  textExecuting="Guardando..."
                  textCompleteExecuting="Guardado!"
                  onCompleted={onCompleted}
                  width="100%"
                />
              </div>
              <div className={styles.filterColumn}>
                <Button
                  displayText="Restablecer Filtros"
                  useExecutingInteraction
                  executeFunction={clickResetFunction}
                  useIcon={false}
                  onCompleted={onCompleted}
                  width="100%"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
