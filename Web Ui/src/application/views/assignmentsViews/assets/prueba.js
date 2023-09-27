window.onload = function () {
    // Esta función se ejecutará cuando la página se haya cargado completamente
    function handleMostrarFormulario() {
      // Mostrar el formulario (asumiendo que tienes lógica para mostrar el formulario)
      const formularioContainer = document.getElementById('formularioContainer');
      formularioContainer.innerHTML = '';  // Limpia el contenido actual
  
      // Crear una instancia del formulario y establecer el estilo oculto por defecto
      const formulario = new Formulario2();
      formulario.style.display = 'none';
  
      // Agregar el formulario al contenedor
      formularioContainer.appendChild(formulario);
  
      // Mostrar el formulario cuando sea necesario
      function mostrarFormulario() {
        formulario.style.display = 'block';
      }
  
      // Llama a la función para mostrar el formulario cuando sea necesario
      // mostrarFormulario();
    }
  
    const tareasContainer = document.getElementById('tareasContainer');
    const tareas = new Tareas(handleMostrarFormulario);  // Pasa la función como argumento
    tareasContainer.appendChild(tareas);  // Agrega las tareas al contenedor
  
    // Llama a la función para mostrar el formulario inicialmente
    // mostrarFormulario();
  };
  