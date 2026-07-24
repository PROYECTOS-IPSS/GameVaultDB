(function() {
  'use strict';

  const STORAGE_KEY = 'pendingCollectionChanges';

  function getPendingChanges() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { add: [], remove: [] };
  }

  function savePendingChanges(changes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
  }

  function addToPending(gameId) {
    const changes = getPendingChanges();
    changes.remove = changes.remove.filter(id => id !== gameId);
    if (!changes.add.includes(gameId)) {
      changes.add.push(gameId);
    }
    savePendingChanges(changes);
  }

  function removeFromPending(gameId) {
    const changes = getPendingChanges();
    changes.add = changes.add.filter(id => id !== gameId);
    if (!changes.remove.includes(gameId)) {
      changes.remove.push(gameId);
    }
    savePendingChanges(changes);
  }

  function updateCardVisual(button, gameId, isInCollection) {
    const form = button.closest('form');
    if (isInCollection) {
      form.action = `/collection/${gameId}/remove`;
      button.className = 'btn btn-success btn-sm d-flex align-items-center';
      button.innerHTML = '<i class="bi bi-check-circle me-1"></i>En colección';
    } else {
      form.action = `/collection/${gameId}/add`;
      button.className = 'btn btn-outline-success btn-sm';
      button.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Añadir';
    }
  }

  function handleCollectionClick(e) {
    e.preventDefault();
    const form = e.target.closest('form');
    const button = e.target.closest('button');
    if (!form || !button) return;

    const action = form.action;
    const match = action.match(/\/collection\/(\d+)\/(add|remove)/);
    if (!match) return;

    const gameId = match[1];
    const currentAction = match[2];

    if (currentAction === 'add') {
      addToPending(gameId);
      updateCardVisual(button, gameId, true);
    } else {
      removeFromPending(gameId);
      updateCardVisual(button, gameId, false);
    }
  }

  async function syncWithServer() {
    const changes = getPendingChanges();
    if (changes.add.length === 0 && changes.remove.length === 0) {
      return;
    }

    try {
      const response = await fetch('/collection/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (response.ok) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error syncing collection:', error);
    }
  }

  function syncWithBeacon() {
    const changes = getPendingChanges();
    if (changes.add.length === 0 && changes.remove.length === 0) {
      return;
    }

    const data = JSON.stringify(changes);
    const blob = new Blob([data], { type: 'application/json' });
    navigator.sendBeacon('/collection/sync', blob);
    localStorage.removeItem(STORAGE_KEY);
  }

  function init() {
    document.addEventListener('click', function(e) {
      if (e.target.closest('form[action*="/collection/"]')) {
        handleCollectionClick(e);
      }
      
      const link = e.target.closest('a[href]');
      if (link && link.href && link.origin === window.location.origin) {
        const href = link.getAttribute('href');
        const changes = getPendingChanges();
        if ((href === '/games' || href === '/collection' || href.startsWith('/games/') || href.startsWith('/collection/')) && 
            (changes.add.length > 0 || changes.remove.length > 0)) {
          e.preventDefault();
          syncWithServer().then(() => {
            window.location.href = link.href;
          });
        }
      }
    });

    window.addEventListener('beforeunload', function() {
      syncWithBeacon();
    });

    const currentPath = window.location.pathname;
    if (currentPath === '/games' || currentPath === '/collection' || currentPath.startsWith('/games/')) {
      syncWithServer();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
