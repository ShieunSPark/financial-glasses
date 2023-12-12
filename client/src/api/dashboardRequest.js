const API_URL = import.meta.env.VITE_API_URL;

export default (JWTtoken) => {
  return fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWTtoken,
    },
  }).then((response) => {
    return response.json();
  });
};
