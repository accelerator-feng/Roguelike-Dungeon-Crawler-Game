import React from 'react';

export default function ToggleButton(props) {
  return (
    <button className="toggleButton" id={props.id} onClick={props.handleClick}>
      {props.label}
    </button>
  );
}
