const urlInput = document.getElementById('urlInput');
const keepParamsInput = document.getElementById('keepParams');
const urlOutput = document.getElementById('urlOutput');
const cleanBtn = document.getElementById('cleanBtn');
const jumpLink = document.getElementById('jumpLink');
const paramModeRadios = document.querySelectorAll('input[name=paramMode]');
const autoRadio = document.querySelector('input[value=auto]');
const rulesRadio = document.querySelector('input[value=rules]');
const manualRadio = document.querySelector('input[value=manual]');
const nowRuleLabel = document.getElementById('now-rule');


function findLastMatchingRule(rawUrl) {
    let url;
    try {
        url = new URL(rawUrl);
    } catch {
        return null;
    }

    const target = url.host + url.pathname + url.search + url.hash;

    let matched = null;
    for (const rule of rules) {
        let pattern = rule.match.trim();

        if (pattern.startsWith('*.')) {
            pattern = '(.+\\.)?' + pattern.slice(2);
        }

        pattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\\\(\.\+\\\.\\\)\?/g, '(.+\\.)?')
            .replace(/\*/g, '.*');

        const regex = new RegExp(`^${pattern}`, 'i');
        if (regex.test(target)) {
            matched = rule;
        }
    }

    return matched;
}

function cleanUrl(rawUrl, keepParams) {
    let url;
    try {
        url = new URL(rawUrl);
    } catch {
        return '';
    }

    const keepSet = new Set(keepParams.map(p => p.trim()).filter(Boolean));
    for (const key of Array.from(url.searchParams.keys())) {
        if (!keepSet.has(key)) {
            url.searchParams.delete(key);
        }
    }
    return url.toString();
}

function runClean(autoOpen = false) {
    const rawUrl = urlInput.value.trim();
    const mode = document.querySelector('input[name=paramMode]:checked').value;
    if (!rawUrl) {
        rulesRadio.disabled = false;
        if (mode === 'auto') {
            keepParamsInput.disabled = false;
            keepParamsInput.value = '';
        }
        nowRuleLabel.innerHTML = '无';
        return;
    }

    const rule = findLastMatchingRule(rawUrl);

    let keepParams = [];

    // 自动模式（auto）
    if (mode === 'auto') {
        if (rule) {
            keepParams = rule.keep;
            keepParamsInput.value = keepParams.join(',');
            keepParamsInput.disabled = true;
            nowRuleLabel.innerHTML = rule.title.replace(/\//g, ' / ');
        } else {
            keepParamsInput.disabled = false;
            keepParams = keepParamsInput.value.split(',');
            nowRuleLabel.innerHTML = '无';
        }
    }

    //  使用内置规则（rules）
    else if (mode === 'rules') {
        if (rule) {
            keepParams = rule.keep;
            keepParamsInput.value = keepParams.join(',');
            keepParamsInput.disabled = true;
            nowRuleLabel.innerHTML = rule.title.replace(/\//g, ' / ');
        } else {
            rulesRadio.disabled = true;
            manualRadio.checked = true;
            keepParamsInput.disabled = false;
            keepParamsInput.value = '';
            keepParams = [];
            nowRuleLabel.innerHTML = '无';
        }
    }

    // 自定义保留参数（manual）
    else {
        keepParamsInput.disabled = false;
        keepParams = keepParamsInput.value.split(',');
        nowRuleLabel.innerHTML = '无';
    }

    // rules 单选框是否可用只取决于是否有规则
    rulesRadio.disabled = !rule;

    const result = cleanUrl(rawUrl, keepParams);
    urlOutput.value = result;

    if (result) {
        jumpLink.href = result;
        jumpLink.style.display = 'inline-block';
        if (autoOpen) {
            window.open(result, '_blank', 'noreferrer');
        }
    } else {
        jumpLink.style.display = 'none';
    }
}

// 常规输入
cleanBtn.addEventListener('click', () => runClean(false));
urlInput.addEventListener('input', () => runClean(false));

paramModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const mode = radio.value;

        if (mode === 'manual') {
            keepParamsInput.disabled = false;
        } else if (mode === 'rules') {
            keepParamsInput.disabled = true;
        } else if (mode === 'auto') {
            keepParamsInput.disabled = false;
        }

        runClean(false);
    });
});

// 拖拽输入
const dropOverlay = document.getElementById('dropOverlay');
let dragCounter = 0;

function showOverlay() {
    dropOverlay.classList.add('active');
    dropOverlay.setAttribute('aria-hidden', 'false');
}

function hideOverlay() {
    dropOverlay.classList.remove('active');
    dropOverlay.setAttribute('aria-hidden', 'true');
}

document.addEventListener('dragenter', e => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('text/plain')) {
        dragCounter++;
        showOverlay();
    }
});

document.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter <= 0) {
        dragCounter = 0;
        hideOverlay();
    }
});

document.addEventListener('dragover', e => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('text/plain')) {
        e.preventDefault();
    }
});

dropOverlay.addEventListener('drop', e => {
    e.preventDefault();
    hideOverlay();
    dragCounter = 0;

    const text = e.dataTransfer.getData('text/plain');
    if (text) {
        urlInput.value = text.trim();
        const rule = findLastMatchingRule(urlInput.value);
        runClean(Boolean(rule));
    }
});

// URL 参数输入
(function handleQueryInput() {
    const params = new URLSearchParams(location.search);
    const inputUrl = params.get('url');
    if (!inputUrl) {
        return;
    }
    try {
        const decoded = decodeURIComponent(inputUrl);
        urlInput.value = decoded;
        const rule = findLastMatchingRule(decoded);
        if (rule) {
            const cleaned = cleanUrl(decoded, rule.keep);
            if (cleaned) {
                location.replace(cleaned);
            }
        } else {
            runClean(false);
        }
    } catch {}
})();