import React from "react"

const className = (...arr) => arr.filter(Boolean).join(' ')

export const Field = React.forwardRef(({help,name,children,error, onChange}, ref) =>{
    if(error){
        help = error
    }
    return  <div className={className("form-group",error && 'has-error') }>
        <label htmlFor={name} className="control-label">{children}</label>
    <textarea className="form-control" ref={ref} id={name} onChange={onChange} rows="10"></textarea>
    {help &&<div className="help-block">{help}</div>}
</div>
})