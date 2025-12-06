describe('ApiTinker Extension', () => {
  beforeEach(() => {
    // Visit the extension popup
    cy.visit('/')
  })

  it('should load the extension popup', () => {
    cy.get('.app-container').should('exist')
    cy.contains('ApiTinker').should('be.visible')
  })

  it('should navigate between tabs', () => {
    cy.contains('Mocks').click()
    cy.contains('Mock Rules').should('be.visible')
    
    cy.contains('Bugs').click()
    cy.contains('Bug Reports').should('be.visible')
    
    cy.contains('Settings').click()
    cy.contains('Settings').should('be.visible')
  })

  it('should send an API request', () => {
    cy.get('input[placeholder="Enter URL..."]').type('https://jsonplaceholder.typicode.com/posts/1')
    cy.get('select').first().select('GET')
    cy.contains('Send').click()
    
    // Wait for response
    cy.contains('Response', { timeout: 10000 }).should('be.visible')
  })

  it('should add a mock rule', () => {
    cy.contains('Mocks').click()
    cy.contains('+ Add Rule').click()
    
    cy.get('input[placeholder="My Rule"]').type('Test Mock Rule')
    cy.get('input[placeholder*="api.example.com"]').type('*://api.test.com/*')
    cy.contains('Add Rule').click()
    
    cy.contains('Test Mock Rule').should('be.visible')
  })

  it('should create a bug report', () => {
    cy.contains('Bugs').click()
    cy.contains('+ New Report').click()
    
    cy.get('input[placeholder="Bug title"]').type('Test Bug')
    cy.get('textarea[placeholder="Describe the bug..."]').type('This is a test bug report')
    cy.contains('Create Report').click()
    
    cy.contains('Test Bug').should('be.visible')
  })

  it('should toggle theme', () => {
    cy.get('button').contains('svg').click() // Theme toggle button
    cy.get('html').should('have.class', 'dark')
  })
})
