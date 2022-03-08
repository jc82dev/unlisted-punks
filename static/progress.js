(window => {
  // const
  const COMPLETED_TIMEOUT_MS = 200;
  // private
  let progress = false;
  const repaint = () => {
    if (progress) {
      const newInc = (100 - progress.dataset.value) * (Math.random() * 0.1);
      progress.dataset.value = parseFloat(progress.dataset.value) + newInc;
      progress.style.width = `${progress.dataset.value}%`;
      window.requestAnimationFrame(repaint.bind(null, progress));
    }
  };
  // return
  window.progress = {
    start() {
      progress && document.body.removeChild(progress);
      progress = document.createElement('div');
      progress.id = 'progress';
      progress.dataset.value = 0;
      document.body.appendChild(progress);
      repaint(progress);
    },
    async stop() {
      return new Promise(resolve => {
        const currentProgress = progress;
        progress = null;
        window.requestAnimationFrame(() => {
          if (currentProgress) {
            currentProgress.style.width = '100%';
            setTimeout(() => {
              document.body.removeChild(currentProgress);
              resolve();
            }, COMPLETED_TIMEOUT_MS);
          }
        });
      });
    },
  };
})(window);
