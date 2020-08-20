import { useState, useCallback } from "react"

async function jsonldFetch(url,method = "GET", data=null){
    const params = {
        method : method,
        headers : {
            "Accept" : 'application/ld+json',
            "content-type" : "application/json"
        }
    }
    if(data){
        params.body = JSON.stringify(data)
    }
    const response = await fetch(url,params)
    if(response.status === 204){
        return null
    }
    const responseData =await response.json()
    // console.log(response.ok)
    
   
    if(response.ok){
        return responseData
    }
    else{
        return responseData
    }
}

export function usePaginatedFetch(url){
    const [loading,setLoading] =  useState(false)
    const [items,setItems] = useState([])
    const [count,setCount] = useState(0)
    const [next,setNext] = useState(null)
    const load =useCallback(async () =>{
        setLoading(true)
        try{
            const response = await jsonldFetch(next || url)
            if(response){
                setItems(items => [...items,...response["hydra:member"]])
                setCount(response['hydra:totalItems'])
                if(response["hydra:view"] && response["hydra:view"]["hydra:next"]){
                    setNext(response["hydra:view"]["hydra:next"])
                }
                
            }
            else{
                console.log(response)
            }
        }
        catch(error){
            console.error(error)
        }
        setLoading(false)
    },[url,next])
    return {
        items,
        load,
        loading,
        count,
        setItems,
        hasMore: next !== null
    }
}

export function useFetch(url, method = "POST", callback = null){
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const load = useCallback(async (data = null) => {
        try{
            const response =  await jsonldFetch(url, method, data)
            if(callback){
                callback(data)
            }
            console.log(response.id)
            if(response.violations){
                setErrors(response.violations.reduce((acc, violation) => {
                    acc[violation.propertyPath] = violation.message
                    // console.log(error.violations)
                    return acc
                }, {}))
            }
            else{
                return response
            }
        }
        catch(error){
            setErrors(error.violations.reduce((acc, violation) => {
                acc[violation.propertyPath] = violation.message
                console.log(error.violations)
                return acc
            }, {}))
            
        }
    },[url, method, callback])
    const clearError = useCallback((name) => {
        if(errors[name]){
            setErrors(errors => ({...useCallback, [name]: null}))
        }
    },[errors])
    return{
        loading,
        errors,
        load,
        clearError

    }
}
