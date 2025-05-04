export const moveTabBar = (targetIndex: number) => {
    if (typeof window === "undefined") return;
  
    const tabMenu = document.querySelector('.tab-menu') as HTMLElement;
    if (!tabMenu) return;
  
    const tabMenuItems = tabMenu.querySelectorAll('.tab-menu-item') as NodeListOf<HTMLElement>;
    const tabBar = tabMenu.querySelector('.tab-menu-bar') as HTMLElement;
    if (!tabBar || !tabMenuItems[targetIndex]) return;
  
    const targetTab = tabMenuItems[targetIndex];
    const targetLeft = targetTab.offsetLeft;
    const targetWidth = targetTab.offsetWidth;
    const tabContainerWidth = tabMenu.offsetWidth;
  
    const containerOffset = (tabContainerWidth - targetWidth) / 2;
    const adjustedLeft = targetLeft - containerOffset;
  
    tabBar.style.transform = `translateX(${adjustedLeft}px)`;
    tabBar.style.width = `${targetWidth}px`;
  };
  
  export const moveContentTabBar = (tabIndex: number) => {
    if (typeof window === "undefined") return;
  
    const sliderInner = document.querySelector('.slider__inner') as HTMLElement;
    const tabMenuItems = document.querySelectorAll('.tab-menu-item');
  
    if (!sliderInner) return;
  
    if (tabIndex >= 0 && tabIndex < tabMenuItems.length) {
      const percentage = tabIndex * -100;
      sliderInner.style.left = `${percentage}%`;
    }
  };
  
  export const enableTdTextSelection = () => {
    if (typeof window === "undefined") return;
  
    const tds = document.querySelectorAll('td[data-label]');
    tds.forEach(td => {
      td.addEventListener('click', function () {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(td);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      });
    });
  };
  
  export const preventHorizontalScrollWheel = () => {
    if (typeof window === "undefined") return;
  
    window.addEventListener('wheel', (e) => {
      if (e.deltaX !== 0) {
        e.preventDefault();
      }
    }, { passive: false });
  };
  