'use client';

import React, { ChangeEvent } from 'react';
import styles from './inputLabel.module.css'
import Search from '../searchComponent/search';

type InputLabelProps = {
  labelText: string;
  inputPlaceHolderText: string;
  onInput: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function InputLabel({
  labelText,
  inputPlaceHolderText,
  onInput
}: InputLabelProps) {
  return (
    <div className={styles.inputLabelContainer}>
      <div className={styles.inputLabelLbl}>
        <h4>{labelText}</h4>
      </div>
      <div className={styles.inputLabelIpt}>
        <Search useSearch={false} showIcon={false} placeHolder={inputPlaceHolderText} onInput={onInput} />
      </div>
    </div>
  );
}
