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
        // 安全的日志方式，避免 undefined 错误
        try {
            console.log('[Network] URL:', finalUrl)
        } catch (e) {
            // 忽略日志错误
        }
        return finalUrl
    }

    export const request: typeof Taro.request = option => {
        // 安全的日志方式
        try {
            console.log('[Network] Request:', {
                url: option.url,
                method: option.method || 'GET',
                hasData: !!option.data
            })
        } catch (e) {
            // 忽略日志错误
        }

        const promise = Taro.request({
            ...option,
            url: createUrl(option.url),
        })

        promise.then(res => {
            try {
                console.log('[Network] Response:', {
                    url: option.url,
                    statusCode: res.statusCode,
                    hasData: !!res.data
                })
            } catch (e) {
                // 忽略日志错误
            }
        }).catch(err => {
            try {
                console.error('[Network] Error:', {
                    url: option.url,
                    errorMsg: err?.errMsg || err?.message || 'Unknown error'
                })
            } catch (e) {
                // 忽略日志错误
            }
        })

        return promise
    }

    export const uploadFile: typeof Taro.uploadFile = option => {
        // 安全的日志方式
        try {
            console.log('[Network] UploadFile:', {
                url: option.url,
                hasFilePath: !!option.filePath,
                name: option.name,
                hasFormData: !!option.formData
            })
        } catch (e) {
            // 忽略日志错误
        }

        const promise = Taro.uploadFile({
            ...option,
            url: createUrl(option.url),
        })

        promise.then(res => {
            try {
                console.log('[Network] UploadFile Response:', {
                    url: option.url,
                    statusCode: res.statusCode,
                    hasData: !!res.data
                })
            } catch (e) {
                // 忽略日志错误
            }
        }).catch(err => {
            try {
                console.error('[Network] UploadFile Error:', {
                    url: option.url,
                    errorMsg: err?.errMsg || err?.message || 'Unknown error'
                })
            } catch (e) {
                // 忽略日志错误
            }
        })

        return promise
    }

    export const downloadFile: typeof Taro.downloadFile = option => {
        // 安全的日志方式
        try {
            console.log('[Network] DownloadFile:', {
                url: option.url
            })
        } catch (e) {
            // 忽略日志错误
        }

        const promise = Taro.downloadFile({
            ...option,
            url: createUrl(option.url),
        })

        promise.then(res => {
            try {
                console.log('[Network] DownloadFile Response:', {
                    url: option.url,
                    statusCode: res.statusCode,
                    hasTempFilePath: !!res.tempFilePath
                })
            } catch (e) {
                // 忽略日志错误
            }
        }).catch(err => {
            try {
                console.error('[Network] DownloadFile Error:', {
                    url: option.url,
                    errorMsg: err?.errMsg || err?.message || 'Unknown error'
                })
            } catch (e) {
                // 忽略日志错误
            }
        })

        return promise
    }
}
