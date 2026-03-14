// Save student ID after login
export function setStudentId(studentId) {
  localStorage.setItem("studentId", studentId)
}

// Get current logged in student
export function getStudentId() {
  return localStorage.getItem("studentId")
}

// Clear login (logout later)
export function clearStudentId() {
  localStorage.removeItem("studentId")
}