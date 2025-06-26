'use client';

import React, { ChangeEvent } from 'react';
import styles from './inputLabel.module.css'
import { Input } from '@/components';

type InputLabelProps = {
  labelText: string;
  inputPlaceHolderText: string;
  onInput: (e: ChangeEvent<HTMLInputElement>) => void;
  customStyle?: React.CSSProperties;
};

export function InputLabel({
  labelText,
  inputPlaceHolderText,
  onInput,
  customStyle
}: InputLabelProps) {
  return (
    <div className={styles.inputLabelContainer}>
      <div className={styles.inputLabelLbl}>
        <h4>{labelText}</h4>
      </div>
      <div className={styles.inputLabelIpt}>
        <Input useSearch={false} showIcon={false} placeHolder={inputPlaceHolderText} onInput={onInput} customStyle={customStyle}/>
      </div>
    </div>
  );
}
