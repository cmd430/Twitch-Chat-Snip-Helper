// ==UserScript==
// @name         Twitch Chat Screenshot Helper
// @namespace    http://tampermonkey.net/
// @version      0.4.4
// @description  Click chat msg on twitch, hides name and badges then opens 'Twitch Char Snip Helper' to get snip of chat on clipboard
// @author       Bred
// @match        https://*.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict'

    /**
      Fix emote margins (fixes overlapping issues
    */
    let head = document.querySelector('head')
    let style = document.createElement('style')
    let css = `.chat-line__message--emote-button {
        margin: 0 0 3px 0 !important;
    }`
    style.type = 'text/css'
    style.appendChild(document.createTextNode(css))
    head.appendChild(style)

    /**
      Element has class
    */
    function hasClass(element, className) {
        return !(!className || !element || !element.classList.length > 0 || !element.classList.contains(className))
    }

    /**
      Find ancestor with class
    */
    function parentByClass(childElement, className) {
        if (!childElement || childElement === document) {
            return null
        } else if (hasClass(childElement, className)) {
            return childElement
        } else {
            return parentByClass(childElement.parentNode, className)
        }
    }

    /**
      Element or Ancestor has class
    */
    function hasClassInTree(element, className) {
        return hasClass(element, className) || parentByClass(element, className)
    }

    /**
      Element child from seletor
    */
    function childBySelector(ancestorElement, selector) {
        let msg = ancestorElement.querySelector(selector)
        if (msg) {
            return msg
        } else {
            return null
        }
    }

    /**
      Main code, see Userscript description
    */
    document.addEventListener('click', el => {
        let body = document.querySelector('body')
        let chat_list = document.querySelector('.chat-list__list-container')
        let chat = hasClassInTree(el.target, 'chat-line__message')

        if (chat === true) {
            chat = el.target
        }
        if (chat !== null) {
            if (hasClassInTree(chat, 'chat-line--inline') !== null) {
                chat = null
            }
        }
        if (chat === null) {
            chat = hasClassInTree(el.target, 'channel-points-reward-line')
            if (chat !== null) {
                chat = chat.parentElement
            }
        }
        if (chat === null) {
            chat = childBySelector(chat, 'div > div > .chat-line--inline.chat-line__message')
        }

        if (chat !== null) {
            chat = chat.cloneNode(true)

            let username = chat.querySelector('.chat-line__username span .chat-author__display-name')
            let mentions = chat.querySelectorAll('.mention-fragment')
            let icons = chat.querySelector('span:not([class])')
            let existingStyle = chat.getAttribute('style')

            mentions.forEach(mention => {
                if (mention.classList.contains('mention-fragment--recipient')) {
                  mention.setAttribute('style', 'color: rgb(255, 255, 255); background: rgb(255, 255, 255);')
                } else {
                  mention.setAttribute('style', 'color: rgb(50, 50, 57); background: rgb(50, 50, 57);')
                }
            })

            username.style.background = username.style.color
            icons.setAttribute('style', `background: ${username.style.color}; padding-top: 15px; height: 0; display: inline-block; overflow: hidden; top: 3px; position: relative;`)
            chat.setAttribute('style', `position: absolute; top: 0; width: 100%; background: rgb(24, 24, 27); z-index: 100; ${existingStyle}`)
            if (chat.classList.contains('bttv-split-chat-alt-bg')) {
                chat.setAttribute('style', `position: absolute; top: 0; width: 100%; background: rgb(31, 25, 37); z-index: 100; ${existingStyle}`)
            }
            if (chat.classList.contains('bttv-highlighted')) {
                chat.setAttribute('style', `position: absolute; top: 0; width: 100%; background: rgb(94, 17, 19); z-index: 100; ${existingStyle}`)
            }

            chat_list.prepend(chat)

            setTimeout(() => {
                let rect = chat.getBoundingClientRect()
                let iframe = document.createElement('iframe')
                iframe.src = `tcsh:${Math.round(rect.x)}:${Math.round(rect.y)}:${Math.round(rect.width)}:${Math.round(rect.height)}`

                body.appendChild(iframe)
                body.removeChild(iframe)

                setTimeout(() => {
                    chat.remove()
                }, 500)
            }, 50)
        }
    })
})()
