import React from "react";

export default function Card({src, alt, key}){
    return(
    <div key = {key}>
      <img style={{ width: 120}}src={src} alt={alt}/>
    </div>)
}