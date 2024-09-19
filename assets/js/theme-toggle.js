document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.querySelector('.theme-toggle');
    toggleButton.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    });
  });