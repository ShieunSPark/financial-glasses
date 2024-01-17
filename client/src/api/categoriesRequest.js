const API_URL = import.meta.env.VITE_API_URL;

export default (userID) => {
  return fetch(`${API_URL}/categories/${userID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  }).then((response) => {
    return response.json();
  });
};
