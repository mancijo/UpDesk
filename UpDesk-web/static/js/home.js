const insertBlur = () => {
    document.getElementsByTagName("body").innerHTML = <div style="w-full h-full blur-sm"></div>
}

openProfile = () =>{
    insertBlur("open");
}