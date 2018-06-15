import React from 'react';

const Speed = (props) => {
  return (
    <div>
      <h2> WPM </h2>
      <div>
        { props.wpm ? props.wpm : '-' }
      </div>
    </div>
  )
};


export default Speed;