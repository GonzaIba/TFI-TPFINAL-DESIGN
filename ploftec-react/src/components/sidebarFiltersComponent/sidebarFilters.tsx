// src/components/forum/SideBarFilters.tsx
"use client";

import { useEffect, useState, Fragment } from "react";
import { GroupEnum } from "@/lib/types/enum";
import { GroupResponse, FilterResponse } from "@/lib/types/forum";
import { filtrosService } from "@/lib/services/forum/filtrosService";
import { Button, Input, InputLabel } from "@/components";
import AnimatedSelect, { UiOption } from '@/components/selectComponent/selectComponent';
import styles from "./sideBarFilters.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { Colors } from "@/theme/colors";
import { FilterTypeEnum } from "@/lib/types/enum";

type SideBarFiltersProps = {
  show?: boolean;
  grupo: GroupEnum;
  closeFunction?: () => Promise<void>;
  resetFunction?: () => Promise<void>;
  saveFunction?: (filters: Record<number, string>) => Promise<void>;
  onCompleted?: () => Promise<void>;
};

export function SideBarFilters({
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

  // Almaceno todo como string para respetar la firma saveFunction
  const [filterValues, setFilterValues] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchGroup = async () => {
      const response = await filtrosService.getGroupByName(grupo);
      setGroupResponse(response);

      const initial: Record<number, string> = {};
      response?.filtersList.forEach((f) => {
        // defaults por tipo
        switch (f.typeValue as FilterTypeEnum) {
          case FilterTypeEnum.BOOL:
            initial[f.codeFilter] = "false";
            break;
          default:
            initial[f.codeFilter] = "";
            break;
        }
      });
      setFilterValues(initial);
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

  // Helper: divide en filas de 2
  const chunkBy2 = <T,>(arr: T[]) => {
    const rows: T[][] = [];
    for (let i = 0; i < arr.length; i += 2) rows.push(arr.slice(i, i + 2));
    return rows;
  };

  const renderField = (item: FilterResponse) => {
    const value = filterValues[item.codeFilter] ?? "";

    switch (item.typeValue as FilterTypeEnum) {
      case FilterTypeEnum.SELECT:
        const opts: UiOption<string>[] = (item.options ?? []).map(o => ({ text: o, value: o }));
        return (
          <div className={styles.field}>
            <label className={styles.label}>{item.descriptionFilter}</label>
            <AnimatedSelect<string>
              options={opts}
              value={(filterValues[item.codeFilter] ?? '') || null}
              onChange={(opt) => updateFilterValue(item.codeFilter, String(opt.value))}
              placeholder={`Seleccione ${item.descriptionFilter.toLowerCase()}…`}
              width="100%"
              align="left"
              springy
            />
            {/* <select
              className={styles.select}
              value={value}
              onChange={(e) => updateFilterValue(item.codeFilter, e.target.value)}
            >
              <option value="">Seleccione una opción...</option>
              {(item.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select> */}
          </div>
        );

      case FilterTypeEnum.BOOL:
        return (
          <div className={styles.field}>
            <label className={styles.label}>{item.descriptionFilter}</label>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={value === "true"}
                onChange={(e) =>
                  updateFilterValue(item.codeFilter, e.target.checked ? "true" : "false")
                }
              />
              <span className={styles.switchText}>{value === "true" ? "Sí" : "No"}</span>
            </label>
          </div>
        );

      case FilterTypeEnum.DATE:
        return (
          <div className={styles.field}>
            <label className={styles.label}>{item.descriptionFilter}</label>
            <input
              className={styles.input}
              type="date"
              value={value}
              onChange={(e) => updateFilterValue(item.codeFilter, e.target.value)}
            />
          </div>
        );

      // STRING (default)
      default:
        return (
          <div className={styles.field}>
            <label className={styles.label}>{item.descriptionFilter}</label>
            <Input
              placeHolder={`Escriba un ${item.descriptionFilter.toLowerCase()} ...`}
              useSearch={false}
              showIcon={false}
              //value={value}
              onInput={(e: { target: { value: string } }) =>
                updateFilterValue(item.codeFilter, e.target.value)
              }
            />
          </div>
        );
    }
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${show ? styles.overlayActive : ""}`}
        onClick={clickCloseFunction}
      />

      <div className={`${styles.sidebarFilters} ${show ? styles.active : ""}`}>
        <div className={styles.sidebarFiltersContainer}>
          <div className={styles.sidebarFiltersPanel}>
            <div className={styles.sidebarFiltersHeadboard}>
              <h3 className={styles.title}>{groupResponse?.descriptionGroup}</h3>
              <Button
                onClick={clickCloseFunction}
                icon={<CloseIcon sx={{ color: Colors.primary }} fontSize="medium" />}
                transparent
                width="45px"
              />
            </div>

            <div className="line-div"></div>

            <div className={styles.sidebarFiltersRows}>
              {/* Campos: 2 por fila */}
              {chunkBy2(groupResponse?.filtersList ?? []).map((row, idx) => (
                <div key={idx} className={styles.fieldsGrid}>
                  {row.map((item) => (
                    <Fragment key={item.codeFilter}>{renderField(item)}</Fragment>
                  ))}
                </div>
              ))}

              <div className={styles.actionsRow}>
                <div className={styles.filterColumn}>
                  <Button onClick={clickSaveFunction} width="100%" text="Guardar Filtros" />
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
