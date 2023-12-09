const API_URL = import.meta.env.VITE_API_URL;

export default () => {
  return fetch(`${API_URL}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
};
