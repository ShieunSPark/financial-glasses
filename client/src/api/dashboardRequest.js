const API_URL = import.meta.env.VITE_API_URL;

export default () => {
  return fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    response.json();
  });
};
