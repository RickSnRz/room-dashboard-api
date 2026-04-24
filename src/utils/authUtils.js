// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
    return localStorage.getItem('token') ? true : false;
  };
  
  // Función para cerrar sesión
  export const logout = () => {
    localStorage.removeItem('token');
  };
  