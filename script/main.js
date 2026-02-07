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

    const target            = url.host + url.pathname;
    const targetHasSearch   = url.host + url.pathname + url.search + url.hash;

    let matched = null;
    for (const rule of rules) {
        let pattern = rule.match.trim();

        pattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\\\(\.\+\\\.\\\)\?/g, '(.+\\.)?')
            .replace(/\*/g, '.*');

        if (!rule.has_search) pattern += '$'

        const regex = new RegExp(`^${pattern}`, 'i');
        if (regex.test(rule.has_search ? targetHasSearch : target)) {
            matched = rule;
            matched.keep ??= []; 
        }
    }

    return matched;
}

function cleanUrl(rawUrl, keepParams = []) {
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
    const rawText = urlInput.value.trim();
    let mode = document.querySelector('input[name=paramMode]:checked').value;
    if (!rawText) {
        rulesRadio.disabled = false;
        if (mode === 'auto') {
            keepParamsInput.disabled = false;
            keepParamsInput.value = '';
        }
        nowRuleLabel.innerHTML = '无';
        return;
    }

    const urls = rawText.split('\n').map(s => s.trim()).filter(Boolean);
    const batchMode = urls.length > 1;

    let outputs = [];

    if (batchMode) {
        rulesRadio.disabled = true;
        nowRuleLabel.innerHTML = '批量处理';
        if (rulesRadio.checked) {
            manualRadio.checked = true;
            mode = 'manual';
        }
        if (mode === 'auto') {
            keepParamsInput.disabled = true;
            keepParamsInput.value = '';
        }
    } else {
        rulesRadio.disabled = false;
    }

    for (const rawUrl of urls) {
        const rule = findLastMatchingRule(rawUrl);
        let keepParams = [];


        if (batchMode) {
            if (mode === 'manual') {
                keepParams = keepParamsInput.value.split(',');
            } else {
                keepParams = rule ? rule.keep : [];
            }
        } else {
            rulesRadio.disabled = !rule;

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
        }

        const result = cleanUrl(rawUrl, keepParams);
        if (result) {
            outputs.push(result);
        }
    }


    const finalResult = outputs.join('\n');
    urlOutput.value = finalResult;

    if (!batchMode && outputs[0]) {
        jumpLink.href = outputs[0];
        jumpLink.style.display = "inline-block";
        if (autoOpen) {
            window.open(outputs[0], "_blank", "noreferrer");
        }
    } else {
        jumpLink.style.display = "none";
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