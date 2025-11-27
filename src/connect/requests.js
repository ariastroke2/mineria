import axios from 'axios';

const handleRequest = async (requestPromise) => {
    try {
        const response = await requestPromise;

        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {

            const message = `Error de red: ${error.response.status} ${error.response.statusText}.`;
            
            console.error("Detalles del error HTTP:", error.response.data);
            
            throw new Error(message);

        } else if (axios.isAxiosError(error) && error.request) {

            throw new Error("No se recibió respuesta del servidor. Revise la conexión o CORS.");
        
        } else {

            throw new Error(`Fallo en la petición: ${error.message}`);
        }
    }
}

export const GET_Request = async ({ url, params = {} }) => {

    if (!url) {
        throw new Error("No se proporcionó una URL de endpoint.");
    }

    return handleRequest(
        axios.get(url, { // <-- Pasamos la Promesa directamente
            params: params 
        })
    );
};

export const POST_Request = async ({ url, data = {} }) => {
    if (!url) {
        throw new Error("No se proporcionó una URL de endpoint.");
    }

    return handleRequest(
        axios.post(url, data)
    );
  };

  export const PUT_Request = async ({ url, data = {}}) => {
    return handleRequest(
        axios.put(url, data)
    );
  };

export const DELETE_Request = async ({ url }) => {
    return handleRequest(
        axios.delete(url)
    );
  };