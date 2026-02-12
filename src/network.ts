import Taro from '@tarojs/taro'

/**
 * 网络请求模块
 * 封装 Taro.request、Taro.uploadFile、Taro.downloadFile，自动添加项目域名前缀
 * 如果请求的 url 以 http:// 或 https:// 开头，则不会添加域名前缀
 *
 * IMPORTANT: 项目已经全局注入 PROJECT_DOMAIN
 * IMPORTANT: 除非你需要添加全局参数，如给所有请求加上 header，否则不能修改此文件
 */
export namespace Network {
    const createUrl = (url: string): string => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        const finalUrl = `${PROJECT_DOMAIN}${url}`
        console.log('[Network] URL:', finalUrl, '(PROJECT_DOMAIN:', PROJECT_DOMAIN + ')')
        return finalUrl
    }

    export const request: typeof Taro.request = option => {
        console.log('[Network] Request:', {
            url: option.url,
            method: option.method,
            data: option.data
        })

        const promise = Taro.request({
            ...option,
            url: createUrl(option.url),
        })

        promise.then(res => {
            console.log('[Network] Response:', {
                url: option.url,
                statusCode: res.statusCode,
                data: res.data
            })
        }).catch(err => {
            console.error('[Network] Error:', {
                url: option.url,
                error: err
            })
        })

        return promise
    }

    export const uploadFile: typeof Taro.uploadFile = option => {
        console.log('[Network] UploadFile:', {
            url: option.url,
            filePath: option.filePath,
            name: option.name,
            formData: option.formData
        })

        const promise = Taro.uploadFile({
            ...option,
            url: createUrl(option.url),
        })

        promise.then(res => {
            console.log('[Network] UploadFile Response:', {
                url: option.url,
                statusCode: res.statusCode,
                data: res.data
            })
        }).catch(err => {
            console.error('[Network] UploadFile Error:', {
                url: option.url,
                error: err
            })
        })

        return promise
    }

    export const downloadFile: typeof Taro.downloadFile = option => {
        console.log('[Network] DownloadFile:', {
            url: option.url
        })

        const promise = Taro.downloadFile({
            ...option,
            url: createUrl(option.url),
        })

        promise.then(res => {
            console.log('[Network] DownloadFile Response:', {
                url: option.url,
                statusCode: res.statusCode,
                tempFilePath: res.tempFilePath
            })
        }).catch(err => {
            console.error('[Network] DownloadFile Error:', {
                url: option.url,
                error: err
            })
        })

        return promise
    }
}
