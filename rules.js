const rules = [
    {
        title: '网易云音乐/歌曲',
        match: 'music.163.com/song*',
        keep: ['id']
    },
    {
        title: '阿里1688/商品',
        match: 'detail.1688.com/offer/*.html*'
    },
    {
        title: 'Bilibili/音频',
        match: 'www.bilibili.com/audio/*'
    },
    {
        title: 'Bilibili/专栏',
        match: 'www.bilibili.com/read/*'
    },
    {
        title: 'Bilibili/视频',
        match: 'www.bilibili.com/video/*',
        keep: ['p', 't']
    },
    {
        title: '京东/商品',
        match: 'item.jd.com/*.html*'
    },
    {
        title: '腾讯文档/通用',
        match: 'docs.qq.com/*/*'
    },
    {
        title: '腾讯文档/表格',
        match: 'docs.qq.com/sheet/*',
        keep: ['tab']
    },
    {
        title: '淘宝/商品',
        match: 'item.taobao.com/item.htm*',
        keep: ['id']
    },
    {
        title: '天猫/商品',
        match: 'detail.tmall.com/item.htm*',
        keep: ['id']
    }
];