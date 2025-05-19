import { createContext } from 'react';

const UserContext = createContext({
  userData: null,
  setUserData: () => {},

  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export default UserContext;