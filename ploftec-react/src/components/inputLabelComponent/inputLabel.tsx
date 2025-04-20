'use client';

import React, { ChangeEvent } from 'react';
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
    <div className="input-label-container">
      <div className="input-label-lbl">
        <h4>{labelText}</h4>
      </div>
      <div className="input-label-ipt">
        <Search showIcon={false} placeHolder={inputPlaceHolderText} onInput={onInput} />
      </div>
    </div>
  );
}
