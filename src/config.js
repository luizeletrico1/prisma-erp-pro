// Se o site estiver rodando no seu PC, usa localhost. Se estiver na nuvem, usa o Render.
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'postgresql://prisma_db_p7tn_user:xRmxc3SjgIJ2kLD9PnuF1Q0kC6VhWJuT@dpg-d622acp5pdvs73b66ipg-a/prisma_db_p7tn';

export default API_URL;