(function() {
  const totalSketches = 57;
  const params = new URLSearchParams(window.location.search);
  const sketchId = parseInt(params.get('sketch')) || 1;

  const select = document.getElementById('sketch-select');

  for (let i = 1; i <= totalSketches; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Sketch ${i}`;
    if (i == sketchId) option.selected = true;
    select.appendChild(option);
  }

  select.onchange = function() {
    window.location.search = '?sketch=' + select.value;
  };

  function goTo(id) {
    if (id >= 1 && id <= totalSketches) {
      window.location.search = '?sketch=' + id;
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      goTo(sketchId - 1);
    } else if (e.key === 'ArrowRight') {
      goTo(sketchId + 1);
    }
  });

  const script = document.createElement('script');
  script.src = 'sketches/' + sketchId + '.js';
  document.head.appendChild(script);
})();
