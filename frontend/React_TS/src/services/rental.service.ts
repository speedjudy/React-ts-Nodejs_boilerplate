import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/rental/';

class RentalService {

  addRental(name: string, addr: string, image: string, flag: string) {
    return axios.post(API_URL + "add", {
      name,
      addr,
      image,
      flag
    });
  }
  getRental() {
    return axios.post(API_URL + 'get');
  }

  removeRental(id: string) {
    return axios.post(API_URL + 'remove', { id });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new RentalService();
