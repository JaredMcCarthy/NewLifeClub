document.addEventListener("DOMContentLoaded", function () {
  // Función para manejar el envío del formulario
  async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent || "";

    // Mostrar estado de carga
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    }

    try {
      // Recopilar datos del formulario
      const formData = {
        eventId: form.querySelector('[name="eventId"]')?.value,
        eventName: form.querySelector('[name="eventName"]')?.value,
        eventDate: form.querySelector('[name="eventDate"]')?.value,
        eventTime: form.querySelector('[name="eventTime"]')?.value,
        eventLocation: form.querySelector('[name="eventLocation"]')?.value,
        eventType: form.querySelector('[name="eventType"]')?.value,
        userName: form.querySelector('[name="userName"]')?.value,
        userEmail: form.querySelector('[name="userEmail"]')?.value,
        userPhone: form.querySelector('[name="userPhone"]')?.value,
      };

      // Validar campos requeridos
      const missingFields = Object.entries(formData)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw new Error("Por favor completa todos los campos requeridos");
      }

      // Intentar enviar datos al servidor
      console.log("📤 Enviando datos de evento:", formData);

      // URL del endpoint de registro de eventos
      const response = await fetch(
        "https://newlifeclub.onrender.com/api/event-registration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      console.log("📡 Respuesta del servidor:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al procesar la inscripción"
        );
      }

      // Intentar parsear la respuesta como JSON
      const responseData = await response.json();

      // Mostrar mensaje de éxito
      form.style.display = "none";
      const successDiv = document.createElement("div");
      successDiv.className = "registration-success";
      successDiv.innerHTML = `
        <div class="check-icon">✓</div>
        <h3>¡Inscripción Exitosa!</h3>
        <p>¡Estás inscrito en ${formData.eventName}!</p>
        <p>Te hemos enviado un correo con los detalles a ${formData.userEmail}</p>
        <p>Fecha: ${formData.eventDate} a las ${formData.eventTime}</p>
        <p>Lugar: ${formData.eventLocation}</p>
      `;

      form.parentNode.insertBefore(successDiv, form.nextSibling);
      successDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      alert(
        error.message ||
          "Error al procesar la inscripción. Por favor, intenta de nuevo."
      );
    } finally {
      // Restaurar estado del botón
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText || "Inscríbete ahora";
      }
    }
  }

  // Agregar manejadores de eventos a los formularios
  const eventForms = [
    "eventRegistrationForm",
    "eventRegistrationForm2",
    "eventRegistrationForm3",
    "eventRegistrationForm4",
  ];

  eventForms.forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }
  });
});
