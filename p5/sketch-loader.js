(function() {
  const params = new URLSearchParams(window.location.search);
  const sketchId = params.get('sketch') || '1';

  const select = document.getElementById('sketch-select');

  for (let i = 1; i <= 40; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Sketch ${i}`;
    if (i == sketchId) option.selected = true;
    select.appendChild(option);
  }

  select.onchange = function() {
    window.location.search = '?sketch=' + select.value;
  };

  const script = document.createElement('script');
  script.src = 'sketches/' + sketchId + '.js';
  document.head.appendChild(script);
})();
