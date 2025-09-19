# OnTimely Email Style Guide

This document serves as a reference for creating consistent email templates across the OnTimely platform.

## 🎨 **Design System**

### **Color Palette**
- **Primary Green**: `#22c55e` (buttons, accents, highlights)
- **Dark Green**: `#16a34a` (button gradients, borders)
- **Background**: `#0f1115` (main background)
- **Card Background**: `rgba(17, 24, 39, 0.55)` (glassmorphism effect)
- **Text Primary**: `#e5e7eb` (main text)
- **Text Secondary**: `#cbd5e1` (labels, subtext)
- **Text Muted**: `#9ca3af` (footer text, small text)
- **Text Dark**: `#6b7280` (very small text)

### **Typography**
- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- **Logo Font**: `font-weight: 800; letter-spacing: -0.02em`
- **Headings**: `font-weight: 700`
- **Body Text**: `font-weight: 400-500`

## 📱 **Layout Structure**

### **Desktop Layout (601px+)**
- **Full Width**: No max-width container
- **Hero Section**: Large header with logo and main heading
- **Two Column**: Main content + visual element
- **Spacing**: Generous padding (40-60px)
- **Typography**: Larger sizes (18px+ body text)

### **Mobile Layout (600px and below)**
- **Container**: `max-width: 400px; margin: 0 auto; padding: 20px`
- **Single Column**: Everything stacked vertically
- **Centered**: All text and elements center-aligned
- **Compact**: Smaller padding (20-30px)
- **Typography**: Smaller sizes (14-16px body text)

## 🎯 **Component Styles**

### **Logo**
```html
<div style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px 30px; border-radius: 15px; box-shadow: 0 8px 32px rgba(34,197,94,0.3);">
  <h1 style="color: #0b1411; margin: 0; font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em;">ONTIMELY</h1>
  <p style="color: #0b1411; margin: 5px 0 0; font-size: 0.9rem; font-weight: 600; opacity: 0.8;">EVENT MANAGEMENT SOFTWARE</p>
</div>
```

### **Primary Button**
```html
<a href="${url}" 
   style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #0b1411; 
          padding: 20px 40px; text-decoration: none; border-radius: 12px; 
          font-weight: 700; font-size: 18px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 12px 32px rgba(34,197,94,0.3);
          transition: all 0.2s ease; border: 2px solid transparent;">
  <span style="margin-right: 10px;">✅</span>
  Button Text
</a>
```

### **Info Card**
```html
<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 30px; border-radius: 15px; margin: 30px 0;">
  <h3 style="color: #22c55e; margin: 0 0 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
    <span style="margin-right: 10px; font-size: 18px;">👤</span>
    Card Title
  </h3>
  <!-- Card content -->
</div>
```

### **Highlight Box**
```html
<div style="background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); padding: 25px; border-radius: 12px; margin: 30px 0;">
  <h4 style="color: #22c55e; margin: 0 0 20px; font-size: 18px; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center;">
    <span style="margin-right: 10px; font-size: 16px;">🚀</span>
    Section Title
  </h4>
  <!-- Content -->
</div>
```

## 📧 **Email Template Structure**

### **Base Container**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: radial-gradient(1200px 800px at 20% -10%, rgba(34,197,94,0.12), transparent 40%), radial-gradient(1000px 700px at 120% 10%, rgba(34,197,94,0.08), transparent 45%), #0f1115; min-height: 100vh; margin: 0; padding: 0;">
  <!-- Desktop Layout -->
  <div style="display: block; max-width: none; margin: 0; padding: 0;">
    <div style="background: rgba(17, 24, 39, 0.55); border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.45); backdrop-filter: blur(8px); overflow: hidden; margin: 24px; min-height: calc(100vh - 48px);">
      <!-- Content -->
    </div>
  </div>
  
  <!-- Mobile Layout -->
  <div style="display: none; max-width: 400px; margin: 0 auto; padding: 20px;">
    <div style="background: rgba(17, 24, 39, 0.55); border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.45); backdrop-filter: blur(8px); overflow: hidden;">
      <!-- Content -->
    </div>
  </div>
  
  <!-- Media Query -->
  <style>
    @media only screen and (max-width: 600px) {
      .desktop-layout { display: none !important; }
      .mobile-layout { display: block !important; }
    }
    @media only screen and (min-width: 601px) {
      .desktop-layout { display: block !important; }
      .mobile-layout { display: none !important; }
    }
  </style>
</div>
```

## 🎨 **Visual Elements**

### **Hero Section**
- **Background**: `linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,163,74,0.1))`
- **Pattern**: Radial gradients for depth
- **Logo**: Prominent green gradient box
- **Typography**: Large, bold headings

### **Glassmorphism Effect**
- **Background**: `rgba(17, 24, 39, 0.55)`
- **Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **Shadow**: `inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.45)`
- **Backdrop**: `backdrop-filter: blur(8px)`

## 📱 **Responsive Breakpoints**

- **Mobile**: `max-width: 600px`
- **Desktop**: `min-width: 601px`

## 🚀 **Usage Examples**

### **Account Confirmation Email**
- Hero section with logo and welcome message
- Account details card
- Confirmation button
- Next steps highlight box
- Footer with expiration notice

### **Guest Form Email**
- Event name as hero text
- Form link button
- Login credentials card
- App download links
- Next steps guide

## 📝 **Best Practices**

1. **Always include both desktop and mobile layouts**
2. **Use the glassmorphism effect for main containers**
3. **Center-align everything on mobile**
4. **Use generous spacing on desktop**
5. **Include fallback links for buttons**
6. **Test across different email clients**
7. **Use inline CSS for maximum compatibility**
8. **Include proper alt text for images**
9. **Use semantic HTML structure**
10. **Test responsive behavior thoroughly**

## 🔧 **Implementation Notes**

- All styles must be inline for email compatibility
- Use `!important` sparingly and only when necessary
- Test with major email clients (Gmail, Outlook, Apple Mail)
- Use web-safe fonts and fallbacks
- Optimize images for email (small file sizes)
- Include proper DOCTYPE and meta tags
