const btn = document.querySelector('.upload-btn');
    const input = document.getElementById('profileImageInput');
    const img = document.getElementById('profileImage');

    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => img.src = e.target.result;
        reader.readAsDataURL(file);
      }
    });