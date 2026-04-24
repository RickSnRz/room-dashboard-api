import axios from 'axios';



export const login = async (email, password) => {
  try {
    const response = await axios.post(`http://localhost:8080/auth/login`, { email, password });
    const { jwt } = response.data; // Extraer el token del JSON

    // Guarda el token JWT en localStorage
    if (jwt) {
      localStorage.setItem('token', jwt);
      console.log('Token guardado:', jwt);
    } else {
      throw new Error('No se recibió un token válido del backend.');
    }

    return response.data;
  } catch (error) {
    throw new Error('No se pudo autenticar el usuario');
  }
};
