export const state = () => ({
  chart: null,
  people: null,
  orgArray: null,
  lines: [],
  showSideScreen: true,
  columnView: true,
  managerNameView: true,
  activeDepartment: null,
  moveDepartment: null,
  editMode: true,
  showEditMenu: null
})

export const mutations = {
  createTree(state, datas) {
    state.orgArray = datas
    state.chart = createTree(datas)[0]
    console.log(state.chart)
    state.chart.showChildren = true
  },
  setPeople(state, datas) {
    state.people = datas
  },
  setColumnView(state, value) {
    state.columnView = value
  },
  setManagerNameView(state, value) {
    state.managerNameView = value
  },
  setEditMode(state, value) {
    state.editMode = value
  },
  showEditMenu(state, event) {
    state.showEditMenu = event
  },
  showChildren(state, dept) {
    var index = state.orgArray.findIndex(e => e.id === dept.id)

    dept.showChildren = true
    state.orgArray.splice(index, 1, dept)
  },
  setActiveDepartment(state, dept) {
    state.activeDepartment = dept
  },
  setShowDepartment(state, dept) {
    state.activeDepartment = dept
    var p = dept.parent
    while (p) {
      p.showChildren = true
      p = p.parent
    }
  },
  deleteDepartment(state) {
    var foundDept = findDept(state.chart, state.activeDepartment)
    if (foundDept && foundDept.parent) {
      foundDept.parent.children = foundDept.parent.children.filter(
        child => child !== state.activeDepartment
      )
    }
    state.activeDepartment = null
    state.showEditMenu = null
  },
  addDepartment(state) {
    var newdept = { ...state.activeDepartment }
    for (var prop in newdept) {
      newdept[prop] = null
    }
    newdept.name = ''
    newdept.id = guid()
    newdept.parent = state.activeDepartment
    newdept.children = []
    state.activeDepartment.children.push(newdept)
    state.activeDepartment.parent.showChildren = true
    state.activeDepartment.showChildren = true
    state.activeDepartment = newdept
    state.showEditMenu = null
  },
  updateActiveDepartmentName(state, name) {
    state.activeDepartment.name = name
  },
  updateActiveDepartmentDescription(state, description) {
    state.activeDepartment.description = description
  },

  updateActiveDepartmentIsStaff(state, isStaff) {
    state.activeDepartment.isStaff = isStaff
  },
  hideChildren(state, dept) {
    var index = state.orgArray.findIndex(e => e.id === dept.id)

    dept.showChildren = false
    state.orgArray.splice(index, 1, dept)
  },
  setMoveDepartment(state) {
    state.moveDepartment = state.activeDepartment
  },
  cancelMoveDepartment(state) {
    state.moveDepartment = null
  },
  doMoveDepartment(state) {
    state.moveDepartment.parent.children = state.moveDepartment.parent.children.filter(
      d => d !== state.moveDepartment
    )
    state.moveDepartment.parent = state.activeDepartment
    state.activeDepartment.children.push(state.moveDepartment)
    state.activeDepartment = state.moveDepartment
    state.moveDepartment = null
    state.showEditMenu = null
  },
  addLine(state) {
    state.lines = updateLines(state.chart, [])
  },
  removeLines(state) {
    state.lines = []
  },
  closeSideScreen(state) {
    state.showSideScreen = false
    var chart = document.getElementById('chart')
    chart.style.marginLeft = '20px'
    state.lines = updateLines(state.chart, [])
  },
  openSideScreen(state) {
    state.showSideScreen = true
    var chart = document.getElementById('chart')
    chart.style.marginLeft = '300px'
    state.lines = updateLines(state.chart, [])
  },
  cancelAll(state) {
    state.showEditMenu = null
    state.moveDepartment = null
  }
}

function updateLines(dept, lines) {
  var svg = document.getElementById('svg')
  var xparent = document.getElementById('chart')
  svg.style.width = xparent.offsetWidth + 'px'
  svg.style.height = xparent.offsetHeight + 'px'
  if (dept.showChildren) {
    dept.children.forEach(child => {
      lines.push(getLine(child))
      updateLines(child, lines)
    })
  }
  return lines
}

function getLine(dept) {
  var pos = getPosOfElement(dept)
  if (!pos.parent) return null
  var d
  if (dept.isStaff) {
    d =
      'M' +
      Math.round(pos.parent.x + 57) +
      ' ' +
      Math.round(pos.parent.y + 50) +
      ' v' +
      Math.round(pos.element.y - pos.parent.y - 25) +
      ' H' +
      Math.round(pos.element.x + 100)
  } else {
    d =
      'M' +
      Math.round(pos.parent.x + 57) +
      ' ' +
      Math.round(pos.parent.y + 50) +
      ' v' +
      Math.round(pos.element.y - pos.parent.y - 70) +
      ' H' +
      Math.round(pos.element.x + 57) +
      ' v26'
  }

  return { d: d }
}

function getPosOfElement(dept) {
  var pos = {
    parent: dept.parent
      ? document.getElementById(dept.parent.id).getBoundingClientRect()
      : null,
    element: document.getElementById(dept.id).getBoundingClientRect()
  }
  var chartpos = document.getElementById('chart').getBoundingClientRect()
  if (pos.parent) {
    pos.parent.x = pos.parent.left - chartpos.left
    pos.parent.y = pos.parent.top - chartpos.top
  }
  pos.element.x = pos.element.left - chartpos.left
  pos.element.y = pos.element.top - chartpos.top

  return pos
}

function createTree(array, parent, nextparent, tree) {
  tree = typeof tree !== 'undefined' ? tree : []
  parent = typeof parent !== 'undefined' ? parent : { id: '' }
  var children = array.filter(child => child.parentId === parent.id)
  if (!parent.id) {
    tree = children
  } else {
    parent['children'] = children
    parent['parent'] = nextparent.id ? nextparent : null
  }
  if (children.length) {
    children.forEach(function(child) {
      createTree(array, child, parent)
    })
  }
  return tree
}
function findDept(chart, dept) {
  console.log(chart, dept)
  if (chart === dept) {
    return dept
  } else {
    var fnd = null
    for (let child of chart.children) {
      fnd = findDept(child, dept)
      if (fnd) break
    }
    return fnd
  }
  return null
}
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  )
}
