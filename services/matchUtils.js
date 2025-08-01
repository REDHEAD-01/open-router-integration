export function filterUsersByCity(users, city) {
  return users.filter(u => u.city?.toLowerCase() === city?.toLowerCase());
}
