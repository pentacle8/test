document.addEventListener('DOMContentLoaded', function() {
    const currentTheme = 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
  
    const toggleButton = document.querySelector('.theme-toggle');
    toggleButton.addEventListener('click', function() {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    });
  });
  