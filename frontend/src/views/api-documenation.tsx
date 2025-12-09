import { useEffect } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css"

const ApiDocumentation: any = () => {
    useEffect(()=> {
        const containerEle = document.getElementById("main-container")
        const format = "bg-white backdrop-blur-sm rounded-lg shadow-sm border border-white/20 h-full overflow-hidden"
        if (containerEle !== null) {
            containerEle.setAttribute("class", format)
        }
    }, [])
    return (
        <SwaggerUI url="http://localhost:8080/swagger.yaml"/>
    )
}

export default ApiDocumentation