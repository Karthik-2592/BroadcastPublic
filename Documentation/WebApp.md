**Frontend components.**

1. React framework
2. Vite build tool
3. Typescript files
4. Frontend location is under directory broadcast/ (different from Broadcast/).
* Create a landing page for the project, using the attached .penpot wireframe as reference.
* For further reference / clarification, use the documents in Documentation directory to understand the project and its scope.
* Keep the structure modular and document very briefly what each component performs (as comments within the source code)
* List of available packages are present in packages.json
* If required, mention what other modules might be required.



Basic details:

1. Site is to use Material UI for most of its themes.
2. Currently, build is targeted at desktops alone. (No mobile site views)
3. Project is built for non-commercial purposes
4. Freedom to use other similar social media sides as reference for site design (e.g. Reddit, Tumblr)



Result:

* Installed Material UI theme
* React Router setup.





###### **LANDING PAGE REFINEMENT:**



1. Align both Search bar and Main feed content (already done)
2. Sharper corners in all elements
3. Outstanding search bar, (Gradient bright outline, and larger border radius)
4. Side bars and Header are to be made 'fixed' instead of current 'relative'.
5. Remove scrollbar for the 'feed' section, as feed will be navigated via the page-scrollbar.
6. Glassmorphism for Navbar.



###### **COMMUNITY PAGE CREATION:**

1. Separate MainLayout from Corresponding pages
2. Dedicated Left Sidebar, but right sidebar is route dependent.
3. Community route contains the following:

   1. Community banner
   2. Community Posts
   3. Community Description
   4. Community Guidelines



Current implementation of \[MainLayout.tsx](file;file:///b%3A/Projects/Broadcast/broadcast/src/layouts/MainLayout.tsx) does not take into account the width of the fixed left-side bar. Consequentially, \[CommunitiesPage.tsx](file;file:///b%3A/Projects/Broadcast/broadcast/src/pages/CommunitiesPage.tsx) expands to the whole page, instead of adjusting with the leftside bar. Make modifications as follows:

1\. Create left margin of fixed width (equal to sidebarwidth) for the Component containing <OutLet>

2\. Adjust \[LandingPage.tsx](file;file:///b%3A/Projects/Broadcast/broadcast/src/pages/LandingPage.tsx) to include this margin into consideration before centering its components.

3\. Decrease the width of the rightside bar in communities section

4\. Must ensure that the feed section (for both communities section and landing page) is vertically aligned with search bar.

5\. Positioning of right side bar need not be fixed, just right of feed.



1\. Search bar is to be in the center of the navbar (horizontally). This also means that Feed section under different routes should also be horizontally centered. Horizontal centering of search bar was done via extending horizontal margins. If this method is used, then align the content (<Feed>) for different routes are well.

2\. Remove the RightSidebar from \[MainLayout.tsx](file;file:///b%3A/Projects/Broadcast/broadcast/src/layouts/MainLayout.tsx) , instead, integerate that sidebar under \[LandingPage.tsx](file;file:///b%3A/Projects/Broadcast/broadcast/src/pages/LandingPage.tsx) .

3\. Reduce the dimensions of Community banner, and include sufficient padding.



1\. To achieve proper horizontal alignment use CSS grids instead of current 'margin:auto' used in \[Feed.tsx](codeContext;file:///b%3A/Projects/Broadcast/broadcast/src/components/Feed/Feed.tsx#L7-22) . Grid has a styling similar to '''.container {

&#x20; display: grid;

&#x20; grid-template-columns: 1fr auto;

&#x20; justify-content: center; /\* centers the grid itself \*/

}'''

2\. Removal of margin:auto from \[Feed.tsx](codeContext;file:///b%3A/Projects/Broadcast/broadcast/src/components/Feed/Feed.tsx#L7-22)  is also to bring the right side bar in close proximity of Feed(). Ensure sufficient padding for this modification.



Wrap the <RightSidebar /> in \[LandingPage.tsx](file;file:///b%3A/Projects/Broadcast/broadcast/src/pages/LandingPage.tsx) inside a max-height container and set the <RightSideBar> in \[RightSidebar.tsx](file;file:///b%3A/Projects/Broadcast/broadcast/src/components/RightSidebar/RightSidebar.tsx) to be sticky.





###### **USER PROFILE SECTION:**

**Core components:**

1. Profile Picture, Profile name, Username, Description
2. Posts, Comments, Saved\_posts sections
3. Follower and Followed count
4. Followers and Followed users
5. Sidebar



**Component Layout:**

1. Profile Description Component:

   * Outer container - \[fixed height, full width, flex col, slightly rounded borders]

     * Profile Header - \[fit to content height, flex row, full width, justify content to flex start, align items center]

       * Profile Picture - \[rounded border (50%), equal width and height (fixed; either relative or absolute units)]
       * Name section - \[flex col, flex to consume remaining width]

         * Profile name - \[Left align, Heavy weight font, large font size]
         * User name - \[Left align, Medium weight font, smaller font size]
     * Profile Description - \[flex col, full width, font-alignment: justified]

       * Text - \[small font size, normal weight font, wrap around, no overflow]



1. Profile Tab component:

   * Outer-container - \[full width, vertical overflow is automatic (expands as needed), scrollable, rounded borders]

     * Navigation tabs - \[full width, fixed height, flex row, gap between items,  space-evenly]

       * Posts\_tab - \[flex : 1, align and justify center, rounded outline]
       * Comments\_tab - \[flex: 1, align and justify center, rounded outline]
       * Saved\_tab - \[flex:1, align and justify center, rounded outline]
     * Tab-content - \[full width, full height, flex col]

       * <Similar to feed>



1. Sidebar Component:

   * Sidebar container - \[fixed width, full height, flex col, rounded edges, sticky]

     * Username - \[text field, left aligned, heavy font weight]
     * User stats - \[2x3 grid]

       * Stat1 - \[flex col, fixed width, fixed height, pos: (row1, col1)]

         * Count - \[text field]
         * Stat1\_name - \[text field]
       * Stat2 - \[flex col, fixed width, fixed height, pos: (row1, col2)]
       * ...
       * Stats included are (Follower count , Following count , posts, time of joining, Communities participated, placeholder)
     * Followers - \[flex col, full width, fit height to content]

       * Profile 1 - \[flex row, full width, align items center, justify content to flex start]

         * Profile picture - \[rounded border (50%), equal width and height]
         * Profile Name
       * Profile 2 ... (Upto 3 accounts)
     * Following - \[flex col, full width, fit height to content]

       * Profile 1 - \[flex row, full width, align items center, justify content to flex start]

         * Profile picture - \[rounded border (50%), equal width and height]
         * Profile Name
       * Profile 2 ... (Upto 3 accounts)



Overall structure:

* Main container - \[full width, full height, sufficient padding]

  * Profile Description component
  * Content - \[grid, templatecolumns: '<xfr> <yfr>']

    * Profile Tabs component
    * Sidebar Component





###### **COMMUNITIES SECTION:**



**Overall Structure:**

* Main container - \[full width, full height, sufficient padding, 25% total horizontal padding (configurable), fixed vertical padding]

  * Title - \[flex row, space between]
  * Content/Feed - \[flex col, gap between elements, justify content from flex start, align items center]





**Title:**

* Outer container - \[full width, fixed height, flex row, space between]

  * Text container - \[fit width to content, full height, large font size, heavy font weight]

    * Text is "Explore Communities"
  * Content/Feed - \[flex col, gap between elements, justify content from flex start, align items center]

    * CommunityCard - \[flex col, full width, fixed height]

      * CommunityBanner -> preexisting
      * CommunityDescription - \[flex col, full width, fixed height, justify content flex start, align items start]

        * Community description





*Note:*

1. *Place all the correct vector icons in respective places (currently, icons are represented by their corresponding name as plain text).*
2. *Ensure symmetric padding and margins.*
3. *Include recommendation elements (Completely random)*

   1. *Posts attached with 'Recommended'*

      1. *due to recent activity*
      2. *your <following\_user> also liked*
   2. Communities attached with 'Recommended'

      1. similar to your community.
      2. your <follower> also joined
4. Include suggestion elements:

   1. Users you may like ...
5. Edit sections
6. Options section for posts, users, comments, etc..
7. 50% rounded borders for several navigation component.
8. Login/SignUp.



