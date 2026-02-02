const rules = [
    {
        title: '网易云音乐/歌曲',
        match: 'music.163.com/song*',
        keep: ['id']
    },
    {
        title: '阿里1688/商品',
        match: 'detail.1688.com/offer/*.html*',
        keep: []
    },
    {
        title: 'Bilibili/视频',
        match: 'www.bilibili.com/video/*',
        keep: ['t']
    },
    {
        title: '京东/商品',
        match: 'item.jd.com/*.html*',
        keep: []
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