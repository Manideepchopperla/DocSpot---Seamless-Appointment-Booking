   import axios from 'axios';

   const instance = axios.create({
     baseURL: import.meta.env.VITE_BASE_URL+'/api', // Adjust the base URL as needed
   });

   export default instance;
   