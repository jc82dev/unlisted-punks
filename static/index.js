(() => {
  // config
  const CONFIG = {
    API_ENDPOINT: 'https://europe-west1-unlisted-punks.cloudfunctions.net/api',
  };
  // consts
  // chains: main:1,ropsten:3,local:1337
  const CHAIN_ID = '0x4';
  const PLACEHOLDER = 'Select...';
  const MESSAGES = {
    METAMASK_NOT_FOUND: `You need an Ethereum wallet to mint NFTs! You can download metamask <a target="_blank" href="https://metamask.io/download/">here</a>`,
    MINT_SUCCESS: `Punks minted successfully! Click <a target="_blank" href="//rinkeby.etherscan.io/tx/{tx}">here</a> to check the transaction on etherscan`,
  };
  // state
  const INITIAl_STATE = {
    gender: 'male',
    skin: 'human-light',
    blemish: null,
    ear: null,
    eyes: null,
    'facial-hair': null,
    head: null,
    mouth: null,
    'mouth-accessory': null,
    neck: null,
    nose: null,
  };
  const STATE = { ...INITIAl_STATE };
  // is loading
  let IS_LOADING = false;
  // contract
  let WEB3 = null;
  let CONTRACT = null;
  let ACCOUNT = null;
  // nodes
  const modal = document.querySelector('#modal');
  const modalContent = modal.querySelector('#modal .modal-content');
  const modalMessage = document.querySelector('#modalMessage');
  const modalMessageContent = document.querySelector('#modalMessage .modal-content');
  const combos = Array.from(document.querySelectorAll(`.combo`));
  const closeButton = document.querySelector('#btnCloseModal');
  const addToCartButton = document.querySelector('#btnAddToCart');
  const connectWalletButton = document.querySelector('#btnConnectWallet');
  const mintFirstPunkButton = document.querySelector('#btnMintFirstButton');
  const result = document.querySelector('.result');
  const cartItems = document.querySelector('#cartItems');
  const mintButton = document.querySelector('#btnMint');
  const closeMessageButton = document.querySelector('#closeMessageButton');
  const currentTotalSpan = document.querySelector('#cartTotal');
  const wallet = document.querySelector('.wallet');
  const walletList = document.querySelector('.wallet-list');
  const builder = document.querySelector('.builder');
  // private
  const getCartItems = () => {
    return Array.from(cartItems.querySelectorAll('.item')).map(i =>
      JSON.parse(decodeURIComponent(i.dataset.mintrequest)),
    );
  };
  const getPunk = async id => {
    window.progress.start();
    IS_LOADING = true;
    resetCart();
    let error = null;
    try {
      const response = await fetch(`${CONFIG.API_ENDPOINT}?method=getPunk&tokenId=${id}`);
      if (response.ok) {
        const body = await response.json();
        return body;
      } else {
        error = await response.text();
      }
    } catch (e) {
      error = e.message;
    } finally {
      IS_LOADING = false;
      window.progress.stop();
      resetCart(error);
    }
  };
  const getObjectPosition = (layer, id, size = 'var(--punk--comboSize)') => {
    if (layer && id) {
      if (layer !== 'gender') {
        if (SPRITES[STATE.gender][layer]) {
          return `calc(-${SPRITES[STATE.gender][layer][id]} * ${size})`;
        } else {
          return null;
        }
      } else {
        return `calc(-${SPRITES[id].skin[STATE.skin]} * ${size})`;
      }
    } else {
      return null;
    }
  };
  const setModalOpen = value => {
    if (value) {
      document.body.style.overflow = 'hidden';
      modal.classList.add('visible');
    } else {
      document.body.style.overflow = 'initial';
      modal.classList.remove('visible');
    }
  };
  const showMessage = (msg, type = 'success') => {
    if (msg) {
      document.body.style.overflow = 'hidden';
      modalMessage.dataset.type = type;
      modalMessage.classList.add('visible');
      modalMessageContent.innerHTML = msg;
    } else {
      document.body.style.overflow = 'initial';
      modalMessage.classList.remove('visible');
      modalMessageContent.innerHTML = '';
    }
  };
  const createCombo = elem => {
    const layer = elem.dataset.combo;
    const selectedId = STATE[layer];
    elem.dataset.empty = !selectedId;
    const basePos = getObjectPosition('skin', STATE.skin);
    elem.innerHTML = `
    <div class="layer-container" style="background-image:${
      !['skin', 'gender'].includes(layer) ? "url('assets/img/sprites.png')" : ''
    };background-position:${basePos}">
        <img class="layer" src="assets/img/sprites.png" style="object-position:${getObjectPosition(
          layer,
          selectedId,
        )}" />
    </div>
    <div class="label-container">
        <div class="label-head">${window.labelize(elem.dataset.combo)}</div>
        <div class="label">${selectedId ? window.labelize(selectedId) : PLACEHOLDER}</div>
    </div>`;
    elem.addEventListener('click', () => {
      document.body.style.overflow = 'hidden';
      const basePos = getObjectPosition('skin', STATE.skin);
      let options = null;
      if (layer === 'gender') {
        options = {
          male: window.SPRITES.male.skin[STATE.skin],
          female: window.SPRITES.female.skin[STATE.skin],
        };
      } else {
        options = window.SPRITES[STATE.gender][layer];
      }
      let html = `<div class="options">`;
      Object.keys(options)
        .map(id => ({ id, pos: options[id] }))
        .forEach(option => {
          let isSelected = false;
          if (option.id === 'none' && (STATE[layer] === 'none' || !STATE[layer])) {
            isSelected = true;
          } else if (option.id !== 'none' && SPRITES[STATE.gender][layer] && SPRITES[STATE.gender][layer][option.id]) {
            isSelected = STATE[layer] === option.id;
          }
          html += `<div data-id="${option.id}" data-empty="${
            option.id === 'none'
          }" data-selected="${isSelected}" class="option" onclick="selectSprite('${layer}','${option.id}')">
                <div class="layer-container" style="background-image:${
                  !['skin', 'gender'].includes(layer) ? "url('assets/img/sprites.png')" : ''
                };background-position:${basePos}">
                    <img class="layer" src="assets/img/sprites.png" style="object-position:${getObjectPosition(
                      layer,
                      option.id,
                    )}" />
                </div>
                <div class="label">${window.labelize(option.id)}</div>
            </div>`;
        });
      html += `</div>`;
      modalContent.innerHTML = html;
      setModalOpen(true);
    });
  };
  const resetCombos = () => {
    const bgPos = getObjectPosition('skin', STATE.skin);
    combos.forEach(c => {
      const layer = c.dataset.combo;
      const g = STATE.gender;
      const value = STATE[layer];
      const isHidden = layer !== 'gender' && !window.SPRITES[g][layer];
      c.dataset.hidden = isHidden;
      const isEmpty = !value || value === 'none';
      c.dataset.empty = isEmpty;
      const layerNode = c.querySelector('.layer');
      const label = c.querySelector('.label');
      layerNode.style = `object-position:${getObjectPosition(layer, value)}`;
      layerNode.dataset.empty = isEmpty;
      label.innerHTML = !isEmpty ? window.labelize(value) : PLACEHOLDER;
      const layerCointainerNode = c.querySelector('.layer-container');
      layerCointainerNode.style.backgroundPosition = bgPos;
      if (layer === 'gender') {
        newPos = bgPos;
      } else if (STATE[layer] && SPRITES[g][layer] && SPRITES[g][layer][STATE[layer]]) {
        newPos = getObjectPosition(layer, STATE[layer]);
      } else {
        c.dataset.empty = 'true';
        newPos = getObjectPosition(layer, null);
        const labelNode = c.querySelector('.label');
        labelNode.innerHTML = PLACEHOLDER;
      }
      c.querySelector('.layer').style.objectPosition = newPos;
    });
  };
  const resetResult = ({ node, state, imgSelector, size } = {}) => {
    node = node || result;
    state = state || STATE;
    imgSelector = imgSelector || `.result > img`;
    size = size || 'var(--punk--result)';
    if (state === STATE) {
      node.dataset.tokenid = window.getTokenId(STATE);
    }
    const images = Array.from(document.querySelectorAll(imgSelector));
    images.forEach(img => {
      if (
        state[img.dataset.layer] &&
        state[img.dataset.layer] !== 'none' &&
        window.SPRITES[state.gender][img.dataset.layer] &&
        window.SPRITES[state.gender][img.dataset.layer][state[img.dataset.layer]]
      ) {
        img.dataset.empty = 'false';
        const pos = getObjectPosition(img.dataset.layer, state[img.dataset.layer], size);
        if (pos) {
          img.style.objectPosition = pos;
        } else {
          img.dataset.empty = 'true';
        }
      } else {
        img.dataset.empty = 'true';
      }
    });
  };
  const resetCart = error => {
    error && showMessage(error, 'error');
    const currentTokenId = parseInt(result.dataset.tokenid);
    const items = getCartItems();
    if (IS_LOADING) {
      addToCartButton.setAttribute('disabled', '');
      addToCartButton.innerHTML = 'Loading...';
    } else {
      addToCartButton.innerHTML = 'Add to cart';
      if (!items.find(i => i.id === currentTokenId)) {
        addToCartButton.removeAttribute('disabled');
      } else {
        addToCartButton.setAttribute('disabled', '');
      }
    }
    if (items.length) {
      mintButton.innerHTML = `Mint ${items.length} punk${items.length > 1 ? 's' : ''}`;
      mintButton.classList.remove('hidden');
      if (IS_LOADING) {
        mintButton.setAttribute('disabled', '');
      } else {
        mintButton.removeAttribute('disabled');
      }
    } else {
      mintButton.classList.add('hidden');
    }
    // recalculate cart amount
    let currentTotal = 0;
    items.forEach(i => (currentTotal += i.price));
    currentTotalSpan.innerHTML = parseFloat(currentTotal / 1000000000);
  };
  const addToCart = () => {
    const currentTokenId = parseInt(result.dataset.tokenid);
    const items = getCartItems();
    if (currentTokenId && !items.includes(i => currentTokenId === i.id)) {
      (async () => {
        const punk = await getPunk(currentTokenId);
        if (punk) {
          const img = `https://infura-ipfs.io/ipfs/${punk.imageCid}`;
          cartItems.insertAdjacentHTML(
            'beforeend',
            `<div data-tokenid="${punk.tokenId}" data-price="${punk.price}" data-mintrequest="${encodeURIComponent(
              JSON.stringify(punk.mintRequest),
            )}" class="item" title="#${punk.tokenId}">
              <div class="img-container"><img src="${img}" /></div>
              <button>Remove</button>
            </div>`,
          );
          document.getElementById('favicon').setAttribute('href', img);
          resetCart();
          Object.assign(STATE, INITIAl_STATE);
          resetCombos();
          resetResult();
          const removeButton = cartItems.querySelector(`[data-tokenid="${currentTokenId}"] > button`);
          if (removeButton) {
            removeButton.addEventListener('click', () => {
              const item = cartItems.querySelector(`[data-tokenid="${currentTokenId}"]`);
              item && item.remove();
              resetCart();
            });
          }
        }
      })();
    }
  };
  const mint = async () => {
    let error = null;
    try {
      const status = await resetWeb3(true);
      if (status === 'not-found') {
        showMessage(MESSAGES.METAMASK_NOT_FOUND, 'error');
      } else if (status === 'connected') {
        if (CONTRACT) {
          const mintRequests = getCartItems();
          if (mintRequests.length) {
            window.progress.start();
            IS_LOADING = true;
            resetCart();
            const cartAmount = mintRequests.reduce((prev, i) => prev + i.price, 0);
            let estimatedGasAmount = await CONTRACT.methods.mint(mintRequests).estimateGas({ from: ACCOUNT });
            estimatedGasAmount += Math.floor(estimatedGasAmount * 0.1);
            const mintResponse = await CONTRACT.methods.mint(mintRequests).send({
              from: ACCOUNT,
              gas: estimatedGasAmount.toString(),
              value: WEB3.utils.toWei(cartAmount.toString(), 'gwei'),
            });
            showMessage(MESSAGES.MINT_SUCCESS.replace('{tx}', mintResponse.transactionHash));
            cartItems.innerHTML = '';
          }
        }
      } else {
        await resetWeb3();
      }
    } catch (e) {
      error = e.message;
    } finally {
      IS_LOADING = false;
      window.progress.stop();
      resetCart(error);
    }
  };
  const connect = async () => {
    const status = await resetWeb3(true);
    if (status === 'not-found') {
      showMessage(MESSAGES.METAMASK_NOT_FOUND, 'error');
    }
  };
  const resetWeb3 = async askConnect => {
    window.progress.start();
    try {
      let status = 'not-found';
      if (Web3.givenProvider) {
        if (!WEB3) {
          WEB3 = new Web3(Web3.givenProvider);
          Web3.givenProvider.on('connect', () => resetWeb3());
          Web3.givenProvider.on('disconnect', () => resetWeb3());
          Web3.givenProvider.on('chainChanged', () => resetWeb3());
          Web3.givenProvider.on('accountsChanged', () => resetWeb3());
        }
        const accounts = await WEB3.eth.getAccounts();
        ACCOUNT = accounts[0];
        if (!ACCOUNT && askConnect) {
          const accounts = await Web3.givenProvider.request({ method: 'eth_requestAccounts' });
          ACCOUNT = accounts[0];
        }
        if (!ACCOUNT) {
          status = 'disconnected';
        } else {
          const currentChain = await Web3.givenProvider.request({ method: 'eth_chainId' });
          if (currentChain !== CHAIN_ID) {
            status = 'invalid-chain';
            if (askConnect) {
              await Web3.givenProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CHAIN_ID }],
              });
            }
          } else {
            if (!CONTRACT) {
              const response = await fetch(`${CONFIG.API_ENDPOINT}?method=getContract`);
              if (response.ok) {
                const config = await response.json();
                CONTRACT = new WEB3.eth.Contract(config.abi, config.address);
              } else {
                const error = await response.text();
                if (error) {
                  throw new Error(error);
                }
              }
            }
            if (CONTRACT) {
              status = 'connected';
            }
          }
        }
      }
      document.querySelector('body').dataset.web3 = status;
      await resetWallet();
      return status;
    } catch (e) {
      showMessage(e.message, 'error');
    } finally {
      window.progress.stop();
    }
  };
  const resetWallet = async () => {
    if (CONTRACT) {
      wallet.dataset.status = 'loading';
      try {
        const punks = [];
        let finished = false;
        let html = '';
        const resultHtml = result.innerHTML;
        do {
          let tokenId = null;
          try {
            tokenId = await CONTRACT.methods.tokenOfOwnerByIndex(ACCOUNT, punks.length).call({ from: ACCOUNT });
            const punk = window.getPunkFromTokenId(parseInt(tokenId));
            html += `<div class="wallet-item-container"><div data-tokenid="${tokenId}" data-walletitem="${punks.length}" class="wallet-item" title="#${tokenId}">${resultHtml}</div><div class="wallet-item-tokenid">${tokenId}</div></div>`;
            punks.push({ ...punk, base: `${punk.gender}-${punk.skin}` });
          } catch (e) {
            finished = true;
          }
        } while (!finished);
        walletList.innerHTML = html;
        setTimeout(() => {
          const walletItems = Array.from(document.querySelectorAll('.wallet-item'));
          walletItems.forEach((item, index) => {
            const state = punks[index];
            const size = `var(--punk--cartSize)`;
            const node = item;
            const imgSelector = `[data-walletitem="${index}"] > img`;
            resetResult({ node, state, imgSelector, size });
          });
          wallet.dataset.status = walletItems.length ? 'connected' : 'empty';
        });
      } catch (e) {
        wallet.dataset.status = 'disconnected';
        showMessage(e.message, 'error');
      }
    } else {
      wallet.dataset.status = 'disconnected';
    }
  };
  // events
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      setModalOpen(false);
    }
  });
  // global
  window.selectSprite = (layer, id) => {
    STATE[layer] = id;
    resetResult();
    const pos = getObjectPosition(layer, id);
    const options = Array.from(modal.querySelectorAll(`.option`));
    options.forEach(o => (o.dataset.selected = o.dataset.id === id));
    setModalOpen(false);
    document.body.style.overflow = 'initial';
    resetCombos();
    resetCart();
  };
  // events
  window.onWeb3Loaded = async () => {
    await resetWeb3();
  };

  // combos
  combos.forEach(c => createCombo(c));
  // buttons
  addToCartButton.addEventListener('click', addToCart);
  mintButton.addEventListener('click', mint);
  connectWalletButton.addEventListener('click', connect);
  mintFirstPunkButton.addEventListener('click', () => builder.scrollIntoView({ behavior: 'smooth' }));
  // close button
  closeButton.addEventListener('click', () => setModalOpen(false));
  // close errr
  closeMessageButton.addEventListener('click', () => showMessage(null));
  // init
  resetResult();
})();
