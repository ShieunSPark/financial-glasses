const API_URL = import.meta.env.VITE_API_URL;

export default () => {
  return fetch(`${API_URL}/dashboard/chart`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  }).then((response) => {
    return response.json();
  });
};
