// ==UserScript==
// @name         Twitch Chat Screenshot Helper
// @namespace    http://tampermonkey.net/
// @version      0.
// @description  Click chat msg on twitch, hides name and badges then opens clipping tool
// @author       Bred
// @match        https://*.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict'

    function hasClass(element, className) {
        return !(!className || !element || !element.classList.length > 0 || !element.classList.contains(className))
    }

    function parentByClass(childElement, className) {
        if (!childElement || childElement === document) {
            return null
        } else if (hasClass(childElement, className)) {
            return childElement
        } else {
            return parentByClass(childElement.parentNode, className)
        }
    }

    function hasClassInTree(element, className) {
        return hasClass(element, className) || parentByClass(element, className)
    }

    document.addEventListener('click', el => {
        let chat = hasClassInTree(el.target, 'chat-line__message')

        if (chat !== true) {
            chat = hasClassInTree(el.target, 'chat-line__message')
        } else {
            chat = el.target
        }

        if (chat !== null) {
            let username = chat.querySelector('.chat-line__username span .chat-author__display-name')
            let icons = chat.querySelector('span:not([class])')

            username.style.background = username.style.color
            icons.setAttribute('style', `background: ${username.style.color}; padding-top: 15px; height: 0; display: inline-block; overflow: hidden; top: 3px; position: relative;`)

            setTimeout(() => {
                let rect = chat.getBoundingClientRect()
                let iframe = document.createElement('iframe')
                iframe.src = `tcsh:${Math.round(rect.x)}:${Math.round(rect.y)}:${Math.round(rect.width)}:${Math.round(rect.height)}`

                document.querySelector('body').appendChild(iframe)
                document.querySelector('body').removeChild(iframe)

                setTimeout(() => {
                    username.style.background = 'transparent'
                    icons.removeAttribute('style')
                }, 300)
            }, 50)
        }
    })
})()
