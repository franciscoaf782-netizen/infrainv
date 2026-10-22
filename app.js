const API_URL = "http://localhost:3000";

async function login() {
  const email = document.getElementById("login-correo").value;
  const password = document.getElementById("login-pass").value;

  if (!email || !password) {
    alert("Por favor, ingresa correo y contraseña");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      document.getElementById("login-view").style.display = "none";
      document.getElementById("app-view").style.display = "block";

      document.getElementById("topbar-user").innerText = data.usuario.nombre;
      document.getElementById("topbar-role").innerText = data.usuario.rol;
      document.getElementById("user-avatar").innerText = data.usuario.nombre.charAt(0).toUpperCase();
    } else {
      alert(data.mensaje || "Credenciales incorrectas");
    }
  } catch (error) {
    console.error("Error en fetch:", error);
    alert("Error de conexión. Asegúrate de que el servidor Node.js esté encendido.");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  document.getElementById("app-view").style.display = "none";
  document.getElementById("login-view").style.display = "block";
  document.getElementById("login-pass").value = "";
}

function navigate(pageName, btn) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) targetPage.classList.add("active");

  const navButtons = document.querySelectorAll(".sidebar button");
  navButtons.forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  if (pageName === "prestamos") {
    cargarPrestamos();
  }
}

async function cargarPrestamos() {
  const tbody = document.getElementById("tabla-prestamos");
  if (!tbody) return;

  try {
    const response = await fetch(`${API_URL}/prestamos`);
    const datos = await response.json();

    if (response.ok) {
      tbody.innerHTML = ""; 
      if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay préstamos registrados</td></tr>`;
        return;
      }

      datos.forEach(prestamo => {
        tbody.innerHTML += `
          <tr>
            <td>${prestamo.utensilio}</td>
            <td>${prestamo.usuario}</td>
            <td>${prestamo.fecha_prestamo || 'N/A'}</td>
            <td><span class="badge">${prestamo.estado}</span></td>
            <td class="text-right">
              <button class="btn btn-sm btn-danger" onclick="alert('Funcion en construccion')">Devolver</button>
            </td>
          </tr>
        `;
      });
    } else {
      console.error("Error del servidor:", datos);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error al conectar con el servidor</td></tr>`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("login-view").style.display = "none";
    document.getElementById("app-view").style.display = "block";
    
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (user) {
      document.getElementById("topbar-user").innerText = user.nombre;
      document.getElementById("topbar-role").innerText = user.rol;
      document.getElementById("user-avatar").innerText = user.nombre.charAt(0).toUpperCase();
    }
  }
  
  const dateLabel = document.getElementById("dashboard-date");
  if(dateLabel) {
      dateLabel.innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
});