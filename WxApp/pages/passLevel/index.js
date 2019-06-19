var config = require("../../services/config").config;
var userService = require('../../services/userServices.js');
var wxRequest = require('/../../services/wxlogin.js');
var questionnaireService = require('../../services/questionnaireService.js');
var redWrap = require('../../services/redWrap.js');
var app = getApp()

Page({
  data: {
    url: config.imgCDNServer,
    loading: false,
    items: [],
    curActivityId: 0,
    pageIndex: 1,
    pageSize: 10,
    height: 300,
    currentId: '',

    isPhoneNumber: true,
    isOpenPanel: true
  },
  onLoad: function () {

    var that = this;
    app.weToast()

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight
        });
      }
    });

    wx.hideShareMenu();
  },

  getList: function () {
    var that = this;
    var addSuvery = wx.getStorageSync("addSuvery", true);
    if (addSuvery) {
      wx.removeStorageSync("addSuvery");
      that.setData({ items: [] });
    }
    if (that.data.items.length === 0) {
      that.setData({ pageIndex: 1 });
      questionnaireService.getQuestionnaireList(that.data.pageIndex, that.data.pageSize).then(function (res) {
        if (res.items.length > 0) {
          res.items.forEach(function (v, i) {
            v.slider = 0,
              v.showMore = false,
              v.name = v.name.length > 10 ? v.name.substring(0, 10) + '...' : v.name
          })
          that.setData({
            items: res.items,
            loading: true
          });
        }
      })
    }
  },
  onShow: function () {
    var openId = wx.getStorageSync('openId') || [];
    var that = this;

    that.panelCloseEvent(); //关闭弹出层

    wx.removeStorageSync("editBank");
    questionnaireService.getOpenActivityStatus().then(function (res) {
      if (res) {
        var isJoinSquare = true;
      } else {
        var isJoinSquare = false;
      }
      that.setData({
        isJoinSquare: isJoinSquare
      });
    })

    that.getList();
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    var that = this;
    this.setData({ pageIndex: 1 });
    questionnaireService.getQuestionnaireList(that.data.pageIndex, that.data.pageSize, '数据刷新中').then(function (res) {
      wx.stopPullDownRefresh();
      that.setData({ items: res.items });
      wx.hideNavigationBarLoading();
    }).catch(function (res) {
      wx.showToast({
        title: res,
        icon: "none",
        duration: 2000
      })

    });
  },
  onReachBottom: function () {
    var that = this;
    that.loadMore();
  },
  slider: function (e) {
    var activityId = e.currentTarget.dataset.activeid;
    var items = this.data.items;
    items.forEach(function (v, i) {
      v.slider = 0
      if (v.activityId == activityId) {
        v.slider = 210
      }
    })
    this.setData({
      items: items
    })
  },
  closeSlider: function (e) {
    var activityId = e.currentTarget.dataset.activeid;
    var items = this.data.items;
    items.forEach(function (v, i) {
      v.slider = 0
    })
    this.setData({
      items: items
    })
  },

  showMore: function (e) {
    var that = this;
    var activityId = e.currentTarget.dataset.activeid;
    var items = that.data.items;

    items.forEach(function (v, i) {
      if (v.activityId == activityId) {
        // v.showMore = !v.showMore
        that.setData({
          panelName: v.name,
          panelRefId: v.refId,
          panelActivityId: v.activityId,
          panelStatus: v.status,
          panelShortUrl: v.shortUrl
        })
      } else {
        v.showMore = false
      }
    })
    that.setData({
      items: items,
      isOpenPanel: false,
    })
  },
  /**
   * 关闭弹出层
   */
  panelCloseEvent() {
    var that = this;
    that.setData({
      isOpenPanel: true
    });
  },
  // showToast: function (e) {
  //   var activityId = e.currentTarget.dataset.activeid;
  //   var isshow = this.data.isshow;
  //   isshow = !isshow
  //   this.setData({
  //     isshow: isshow
  //   })

  //   this.setData({
  //     curActivityId: activityId,
  //     currentId: isshow ? activityId : ''
  //   })
  // },
  deleteQuestionnaire: function (event) {
    var id = event.currentTarget.dataset.activeid;
    var that = this;
    wx.showActionSheet({
      itemList: ['确认删除'],
      success: function (res) {
        if (res.tapIndex == 0) {
          var index = -1;
          for (var i = 0; i < that.data.items.length; i++) {
            if (that.data.items[i].activityId == id) {
              index = i;
            }
          }

          var items = that.data.items;
          questionnaireService.deleteQuestionnaire(parseInt(id)).then(function (res) {
            items.splice(index, 1);
            that.setData({ items: items });
            wx.showToast({
              title: '成功删除',
              icon: 'success',
              duration: 1500,
              success: function () {
                that.panelCloseEvent();
              }
            })
          }).catch(function (res) {
            wx.showToast({
              title: res,
              icon: "none",
              duration: 2000
            })
          });
        }
      },
      fail: function (res) {

      }
    })

  },
  /**
   * 复制
   */
  cloneQuestionnaire: function (event) {
    var id = event.currentTarget.dataset.activeid;
    var status = event.currentTarget.dataset.status;
    var that = this;
    if (status == 101) {
      wx.showToast({
        title: '该闯关内容涉及敏感信息，已被暂停访问',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    questionnaireService.cloneQuestionnaire(parseInt(id)).then(function (res) {
      that.setData({
        items: []
      })
      that.onShow();
      that.panelCloseEvent();
    }).catch(function (res) {
      wx.showToast({
        title: res,
        icon: 'none',
        duration: 2000
      })
    });
  },
  editQua: function (e) {
    var that = this;
    var status = e.currentTarget.dataset.status;
    var activeid = e.currentTarget.dataset.activeid;
    var refId = e.currentTarget.dataset.refid;
    var backStatus = 1;
    if (status == 101) {
      wx.showToast({
        title: '该闯关内容涉及敏感信息，已被暂停访问',
        icon: 'none',
        duration: 2000
      })
      return;
    } else {
      if (refId) {
        wx.setStorage({
          key: 'editBank',
          data: {
            activityId: activeid
          }
        })
        wx.switchTab({
          url: 'chooseCheckPoints/chooseCheckPoints',
        })
        setTimeout(function () {
          that.panelCloseEvent();
        }, 1000)
      } else {
        wx.navigateTo({
          url: '/pages/passLevel/editQue/editQue?activityId=' + activeid,
        })
        setTimeout(function () {
          that.panelCloseEvent();
        }, 1000)
      }
    }
  },
  // 问卷运行状态
  stopSurvey: function (event) {
    var id = event.currentTarget.id;
    var sid = event.currentTarget.dataset.sid;
    var status = event.currentTarget.dataset.status;
    var that = this;
    this.setData({
      curActivityId: id
    })



    if (status !== 1 && status !== 101) {
      userService.verify().then(function (res) {
        if (!res) {
          that.setData({
            isPhoneNumber: false
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '是否发布该闯关！',
            success: function (res) {

              if (res.confirm) {
                questionnaireService.auidt(sid).then(function (res) {
                  wx.showToast({
                    title: '已发布',
                    icon: 'none',
                    duration: 1000,
                    success: function () {
                      setTimeout(function () {
                        that.panelCloseEvent();
                      }, 1000)
                    }
                  })
                  var items = that.data.items;
                  for (var i = 0; i < that.data.items.length; i++) {
                    if (items[i].activityId === parseInt(id)) {
                      items[i].status = 1;
                    }
                  }
                  that.setData({ items: items });
                }).catch(function (res) {
                  if (res.status != 200) {
                    wx.showToast({
                      title: res,
                      icon: 'none',
                      duration: 2000
                    })

                  }
                })
              }
            }
          })
        }
      })
    }
    if (status == 101) {
      wx.showToast({
        title: '该闯关内容涉及敏感信息，已被暂停访问',
        icon: 'none',
        duration: 2000
      })
    }
    if (status == 1) {
      questionnaireService.setStatus(sid, 2).then(function (res) {
        wx.showToast({
          title: '已暂停',
          icon: 'none',
          duration: 1000,
          success: function () {
            setTimeout(function () {
              that.panelCloseEvent();
            }, 1000)
          }
        })
        var items = that.data.items;
        for (var i = 0; i < that.data.items.length; i++) {
          if (items[i].activityId === parseInt(that.data.curActivityId)) {
            items[i].status = 2;
          }
        }
        that.setData({ items: items });
      }).catch(function (res) {
        if (res.status != 200) {
          wx.showToast({
            title: res,
            icon: 'none',
            duration: 2000
          })
        }
      });
    }

  },
  /**
   * 参与闯关体验区
   */
  joinSquareEvent: function () {
    var that = this;

    wx.navigateTo({
      url: '/pages/passLevel/squareZone/squareZone'
    })
  },
  loadMore: function () {

    var that = this;
    questionnaireService.getQuestionnaireList(that.data.pageIndex + 1, that.data.pageSize).then(function (res) {
      var items = that.data.items;
      if (res.items.length > 0) {
        for (var i = 0; i < res.items.length; i++) {
          items.push(res.items[i]);
        }

        that.setData({ items: items, pageIndex: that.data.pageIndex + 1 });
      } else {
        wx.showToast({
          title: '已经加载到最后一页',
          icon: 'none',
          duration: 2000
        })
      }

    }).catch(function (res) {
      if (res.status != 200) {
        wx.showToast({
          title: res,
          icon: 'none',
          duration: 2000
        })
      }
    })

  },
  /**
   * 分享
   */
  share: function (e) {
    var that = this;
    var id = e.currentTarget.id;

    if (e.currentTarget.dataset.status == 1) { //已经发布
      wx.navigateTo({
        url: '/pages/passLevel/share/share?shortUrl=' + e.currentTarget.dataset.shorturl + "&activityId=" + id
      })
      setTimeout(function () {
        that.panelCloseEvent();
      }, 1000)
    }

    if (e.currentTarget.dataset.status === 101) {
      wx.showToast({
        title: '您的闯关没有通过审核，不能分享！',
        icon: 'none',
        duration: 2000
      });
      return false;
    } else if (e.currentTarget.dataset.status !== 1) {
      wx.showModal({
        title: '提示',
        content: '您的闯关还未发布，确认是否发布?',
        success: function (res) {
          if (res.confirm) {  //点击确认进行验证手机号码
            userService.verify().then(function (res) {
              if (!res) { //没有验证手机号码
                that.setData({
                  isPhoneNumber: false
                });
              } else { //手机验证通过
                that.phoneThrough(e.currentTarget.dataset.shorturl, id);
              }
            })
          }
        }
      })
    }
  },
  modalCancelEvent(e) {
    var that = this;
    that.setData({
      isPhoneNumber: true
    });
  },
  getPhoneNumberEvent() {
    var that = this;
    that.setData({
      isPhoneNumber: true
    });
  },
  phoneThrough(shorturl, id) {
    var that = this;
    questionnaireService.auidt(shorturl).then(function (res) {  //进行发布
      var items = that.data.items;
      for (var i = 0; i < that.data.items.length; i++) {
        if (items[i].activityId === parseInt(id)) {
          items[i].status = 1;
        }
      }
      that.setData({ items: items });
      wx.navigateTo({
        url: '/pages/passLevel/share/share?shortUrl=' + shorturl + "&activityId=" + id
      })
      setTimeout(function () {
        that.panelCloseEvent();
      }, 1000)
    }).catch(function (res) {
      if (res.status != 200) {
        wx.showToast({
          title: res,
          icon: 'none',
          duration: 2000
        })
      }
    });
  },
  /**
   * 自动获取手机号码
   */
  getPhoneNumber(e) {
    var that = this;

    that.getSessionId();

    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.navigateTo({
        url: '/pages/passLevel/bindPhone/bindPhone'
      })
    } else {
      userService.getAutoMobileFn(that.data.sessionId, e.detail.encryptedData, e.detail.iv).then(function (res) {
        wx.showToast({
          title: '绑定成功！',
          icon: "success",
          duration: 1500,
          success: function () {
            setTimeout(function () {
              that.phoneThrough(e.currentTarget.dataset.shorturl, e.currentTarget.dataset.id);
            }, 1500)
          }
        })
      }).catch(function () {
        wx.navigateTo({
          url: '/pages/passLevel/bindPhone/bindPhone'
        })
      })
    }

    that.setData({
      isPhoneNumber: true
    });
  },
  /**
   *  获取sessionId
   */
  getSessionId() {
    var that = this;
    var openId = wx.getStorageSync('openId') || '';
    if (openId && openId.length > 0) {
      var expireTimeStamp = openId.split(":")[1];
      var timestamp = new Date().getTime();
      if (timestamp > expireTimeStamp) {
        openId = "",
          wx.removeStorageSync("openId");
      } else {
        openId = openId.split(":")[0];
        that.setData({
          sessionId: openId
        });
      }
    }

    if (!openId) {
      wxRequest.wxLogin().then(function (res) {
        return wxRequest.getWxAuthrize(res.code);
      }).then(function (res) {
        that.setData({
          sessionId: res.data
        });
      })
    }
  },
  /**
   * 排行榜
   */
  lookRankEvent(e) {
    var that = this;
    var shortUrl = e.currentTarget.dataset.shorturl;
    var activityId = e.currentTarget.dataset.activeid;

    wx.navigateTo({
      url: '/pages/passLevel/rank/rank?shortUrl=' + shortUrl + "&activityId=" + activityId,
    })
    setTimeout(function () {
      that.panelCloseEvent();
    }, 1000)
  },
  /**
   * 红包
   */
  goRed(e) {
    var that = this;
    this.setData({
      activityId: e.currentTarget.id
    })
    redWrap.getRedPack(e.currentTarget.id).then(function (res) {
      if (res.length == 0) {
        wx.navigateTo({
          url: '/pages/passLevel/redpackMoney/redpackMoney?activityId=' + that.data.activityId,
        })
      } else {
        wx.navigateTo({
          url: '/pages/passLevel/redpackSet/redpackSet?activityId=' + that.data.activityId,
        })
      }
      setTimeout(function () {
        that.panelCloseEvent();
      }, 1000)
    })
  },
  /**
   * 设置
   */
  settingEvent(e) {
    var that = this;
    var activityId = e.currentTarget.dataset.activeid;

    wx.navigateTo({
      url: '/pages/passLevel/setOption/setOption?isProcess=1&activityId=' + activityId,
    })
    setTimeout(function () {
      that.panelCloseEvent();
    }, 1000)
  },
  notAllowMoveEvent() {

  },
  yourSelfCloseEvent() {
    var that = this;
    that.panelCloseEvent();
  }
  // onShareAppMessage: function (res) {
  //   var nname = this.data.nickName ? this.data.nickName : '';
  //   if (res.from === 'button') {
  //     // 来自页面内转发按钮
  //     if (res.target.dataset.status!==1){

  //     }
  //   }
  //   return {
  //     title: nname + '邀你参与闯关答题—' + res.target.dataset.name,
  //     path: '/pages/passLevel/passShow/passShow?shortUrl=' + this.data.shortUrl,
  //     success: function (res) {
  //       // 转发成功
  //     },
  //     fail: function (res) {
  //       // 转发失败
  //     }
  //   }


  // }
});