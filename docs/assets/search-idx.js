export default [
    {
        "title": "Home",
        "fileName": "index.html",
        "text": "Home  Salesforce Trigger Framework Credit Based on Kevin O’Hara’s famous framework sfdc-trigger-framework  Overview   Triggers should be logicless. Putting logic into your triggers creates un-testable, difficult-to-maintain code. It's widely accepted that a best-practice is to move trigger logic  into a handler class.   This trigger framework bundles a single TriggerHandler  base class that you can inherit from in all of your trigger handlers. The base class includes  context-specific methods that are automatically called when a trigger is executed.   The base class also provides a secondary role as a supervisor for Trigger execution. It acts like a watchdog, monitoring trigger activity and providing an api for controlling  certain aspects of execution and control flow. But the most important part of this framework is that it's minimal and simple to use. Usage Trigger Handler   To create a trigger handler, you simply need to create a class that inherits from TriggerHandler . Here is an example for creating an Opportunity trigger handler. public class OpportunityTriggerHandler extends TriggerHandler {    In your trigger handler, to add logic to any of the trigger contexts, you only need to override them in your trigger handler. Here is how we would add logic to a  beforeUpdate, afterUpdate  trigger.   A sample AccountSampleTriggerHandler   class has been included in this repository, as well as a sample  trigger .   Note:   When referencing the Trigger static maps within a class, SObjects are returned versus SObject subclasses like Opportunity, Account, etc. This means that you must cast when you  reference them in your trigger handler. You could do this in your constructor if you wanted. Technically, you only need to cast for oldMap and newMap, but for completeness, I  encourage casting Trigger.new and Trigger.old as well. public class OpportunityTriggerHandler extends TriggerHandler {  private List<Opportunity> newRecords;  private List<Opportunity> oldRecords;  private Map<Id, Opportunity> newRecordsMap;  private Map<Id, Opportunity> oldRecordsMap;  public OpportunityTriggerHandler(){    super('OpportunityTriggerHandler');    this.newRecords =(List<Opportunity>) Trigger.new;    this.oldRecords =(List<Opportunity>) Trigger.old;    this.newRecordsMap =(Map<Id, Opportunity>) Trigger.newMap;    this.oldRecordsMap =(Map<Id, Opportunity>) Trigger.oldMap;  }  public override void beforeUpdate() {    for(Opportunity o : newRecords) {      // do something     }  }  public override void afterUpdate() {      // do something   }  // add overrides for other contexts }  Trigger   To use the trigger handler, you only need to construct an instance of your trigger handler within the trigger handler itself and call the run()  method. Here is an  example of an Opportunity trigger.   This is the way to write a trigger that will run the trigger handlers below. Note that some objects do not work in every context, so ensure that you list only applicable trigger  contexts in your trigger definition and that you only override those contexts. If you include extra contexts, they will not be covered by Apex tests, which could lead to  deployment problems. trigger OpportunityTrigger on Opportunity(before update, after update) {  new OpportunityTriggerHandler().run();}  There is also a faster way to write the trigger, specifying the handler class name so the handler does not need to describe the class for its name, saving precious execution time:trigger OpportunityTrigger on Opportunity(before update, after update) {  new OpportunityTriggerHandler('OpportunityTriggerHandler').run();}  Cool Stuff Bypass API What if you want to tell other trigger handlers to halt execution? That's easy with the bypass api: public class OpportunityTriggerHandler extends TriggerHandler {  private Map<Id, Opportunity> newRecordsMap;  /* Optional Constructor - better performance */  public OpportunityTriggerHandler(){    super('OpportunityTriggerHandler');    this.newRecordsMap =(Map<Id, Opportunity>) Trigger.newMap;  }  public override void afterUpdate() {    List<Opportunity> opps = [SELECT Id, AccountId FROM Opportunity WHERE Id IN :newRecordsMap.keySet()];    Account acc = [SELECT Id, Name FROM Account WHERE Id = :opps.get(0).AccountId];    TriggerHandler.bypass('AccountTriggerHandler');    acc.Name = 'No Trigger';    update acc; // won't invoke the AccountTriggerHandler    TriggerHandler.clearBypass('AccountTriggerHandler');    acc.Name = 'With Trigger';    update acc; // will invoke the AccountTriggerHandler   }}  Check Bypass Status If you need to check if a handler is bypassed, use the isBypassed  method: if(TriggerHandler.isBypassed('AccountTriggerHandler')) {  // ... do something if the Account trigger handler is bypassed!}  Global Bypass To bypass all handlers, set the global bypass variable: TriggerHandler.setGlobalBypass();    This will also add an entry 'bypassAll' to the list of handlers returned in  bypassList .   To clear all bypasses for the transaction, simply use the  clearAllBypasses   method, as in: // ... done with bypasses!TriggerHandler.clearAllBypasses();// ... now handlers won't be ignored!     This will clear the list of bypassed handlers and set the  globalBypass   Boolean to false. Set Bypass   If you are not sure in a transaction if a handler is bypassed, but want to bypass it(or clear the bypass) and then set it to its original value, use the  setBybass   method: Boolean isBypassed = TriggerHandler.isBypassed('AccountTriggerHandler');TriggerHandler.bypass('AccountTriggerHandler');// do something here TriggerHandler.setBypass('AccountTriggerHandler', isBypassed);  To store all currently bypassed handlers, temporarily bypass all handlers, and then restore the originally bypassed list: List<String> bypassedHandlers = TriggerHandler.bypassList();TriggerHandler.bypassAll();// do something here TriggerHandler.clearAllBypasses(); // or TriggerHandler.clearGlobalBypass() TriggerHandler.bypass(bypassedHandlers);  Max Loop Count   To prevent recursion, you can set a max loop count for Trigger Handler. If this max is exceeded, and exception will be thrown. A great use case is when you want to ensure that  your trigger runs once and only once within a single execution. Example: public class OpportunityTriggerHandler extends TriggerHandler {  private Map<Id, Opportunity> newRecordsMap;  public OpportunityTriggerHandler(){    /* Optional Constructor overload - better performance */    super('OpportunityTriggerHandler');    this.newRecordsMap =(Map<Id, Opportunity>) Trigger.newMap;    this.setMaxLoopCount(1);  }  public override void afterUpdate() {    List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE Id IN :newRecordsMap.keySet()];    update opps;  }}  Debug Statements There are two methods that will show additional information.   showLimits()   will debug Apex query and DML limits when the trigger handler has completed.   showDebug()   will debug trigger entry and exit. To use one or both of these, amend them to the trigger - you can assign them for every handler or only specific ones: TriggerHandler.showLimits();AccountTriggerHandler.showDebug();new AccountSampleTriggerHandler().run();TriggerHandler.showLimits(false);AccountTriggerHandler.showDebug(false);  Overridable Methods Here are all of the methods that you can override. All of the context possibilities are supported.   beforeInsert()    beforeUpdate()    beforeDelete()    afterInsert()    afterUpdate()    afterDelete()    afterUndelete()"
    },
    {
        "title": "triggerhandlerhome",
        "fileName": "triggerhandlerhome.html",
        "text": "SampleTriggerHandler  General Theme Each object has a single trigger Each trigger has a single handler Bypass Documentation       https://github.com/dschach/salesforce-trigger-framework/blob/main/README.md    Sample Trigger trigger AccountSampleTrigger on Account(before insert, after insert, before update, after update, before delete, after delete, after undelete) {  new AccountSampleTriggerHandler().run();}  Sample Handler /** * @description A sample Account trigger handler, with some comments * * @author David Schach * @since 2021 * @see AccountSampleTriggerHandlerTest */public without sharing class AccountSampleTriggerHandler extends TriggerHandler {  private List<Account> newRecords;  private List<Account> oldRecords;  private Map<Id, Account> newRecordsMap;  private Map<Id, Account> oldRecordsMap;  public AccountSampleTriggerHandler() {    super('AccountSampleTriggerHandler');    this.newRecords =(List<Account>)Trigger.new;    this.oldRecords =(List<Account>)Trigger.old;    this.newRecordsMap =(Map<Id, Account>)Trigger.newMap;    this.oldRecordsMap =(Map<Id, Account>)Trigger.oldMap;  }  public override void beforeInsert(){    method1();    method2();    TriggerHandler.clearAllBypass();  }  public override void beforeUpdate(){    method2();  }  public override void afterInsert(){    TriggerHandler.bypass('ContactTriggerHandler');    updateContacts();    TriggerHandler.clearBypass('ContactTriggerHandler');  }  public override void afterUpdate(){    TriggerHandler.bypass('CaseSampleTriggerHandler');    /* do something */    TriggerHandler.clearAllBypasses();  }  //public override void beforeDelete(){}  //public override void afterDelete(){}  //public override void afterUndelete(){}  private void method1(){    for(Account a : newRecords){      a.Name = a.Name.toUpperCase();    }  }  private void method2(){    for(Account a : newRecords){      a.Name = a.Name.toLowerCase();    }  }  /**  * Try to keep all updates on other objects in a single DML statement  * @author Author Name  */  private void updateContacts(){    List<Contact> acctContacts = [SELECT Id FROM Contact WHERE AccountId IN :newRecordsMap.keyset()];    update acctContacts;  }}  Credits   This trigger framework is from  https://github.com/dschach/sfdc-trigger-framework  which is based on Kevin O'Hara's framework  https://github.com/kevinohara80/sfdc-trigger-framework"
    },
    {
        "title": "TriggerHandler",
        "fileName": "TriggerHandler.html",
        "text": "TriggerHandler Trigger Handler virtual class as base for all trigger handlers Signature public virtual class TriggerHandler See License , GitHub , TriggerHandlerTest Kevin OHara  David Schach 2013 TriggerHandler Properties Name Signature Description BYPASS_ALL_ALIAS private static final String BYPASS_ALL_ALIAS This is the value that will be in the returned list or set when global bypass is active bypassedHandlers private static Set<String> bypassedHandlers All bypassed handlers ERROR_TRIGGERCONTEXT private static final String ERROR_TRIGGERCONTEXT Error text - assumes English for debug logs globalBypass private static Boolean globalBypass true  if we bypass all triggers without checking the contents of bypassedHandlers handlerName private String handlerName The name of this handler. Set by getHandlerName() isTriggerExecuting private Boolean isTriggerExecuting Is this class executing in trigger context? loopCountMap private static Map<String, LoopCount> loopCountMap Map of handlerName  => times run()  was invoked showDebug private static Boolean showDebug true  if we include a debug statement for trigger entry and exit showLimits private static Boolean showLimits true  if we include a debug statement for limits triggerEvent private System.TriggerOperation triggerEvent The current triggerEvent of the trigger, overridable in tests TriggerHandler Constructors TriggerHandler() Basic constructor. Slower than the other one TriggerHandler(handlerName) Constructor with handler name to improve performance TriggerHandler() Basic constructor. Slower than the other one Signature public TriggerHandler() See TriggerHandler.TriggerHandler Example new AccountSampleTriggerHandler().run(); TriggerHandler(handlerName) Constructor with handler name to improve performance Signature public TriggerHandler(String handlerName) Parameters handlerName Type: String The name of the handler Author David Schach Since 2021 Example new AccountSampleTriggerHandler('AccountSampleTriggerHandler').run(); (in Trigger Handler) public AccountSampleTriggerHandler(String className) { this.newRecords =(List<Account>)Trigger.new; this.oldRecords =(List<Account>)Trigger.old; this.newRecordsMap =(Map<Id, Account>)Trigger.newMap; this.oldRecordsMap =(Map<Id, Account>)Trigger.oldMap; } TriggerHandler Methods afterDelete() Virtual method for the implementing class to override afterInsert() Virtual method for the implementing class to override afterUndelete() Virtual method for the implementing class to override afterUpdate() Virtual method for the implementing class to override beforeDelete() Virtual method for the implementing class to override beforeInsert() Virtual method for the implementing class to override beforeUpdate() Virtual method for the implementing class to override bypass(handlerName) Bypass by string bypass(handlerType) Bypass by type/class. This is probably best for avoiding typos. bypass(handlerNames) Bypass by list, e.g. TriggerHandler.bypass(listOfHandlerStrings) bypassAll() Bypass all handlers(clear bypassedHandlers to prevent confusion) bypassList() Return a list of the bypassed handlers Though both Set and List allow contains(value), we include both methods for convenience bypassSet() Return a Set of the bypassed handlers Though both Set and List allow contains(value), we include both methods for convenience clearAllBypasses() Clear all bypasses - by clearing the global bypass and by clearing the list of bypassed handlers clearBypass(handlerName) Bypass a specific handler by name clearBypass(handlerType) Bypass a specific handler by type clearBypass(handlerNames) Bypass a list of handlers clearBypassList() Clear the entire bypass list, but keep the global bypass flag intact This is useful for resetting the list of handlers to bypass while maintaining global bypassing clearGlobalBypass() Clear only the global bypass flag, leaving the list of bypassed handlers intact This is useful for keeping a base set of bypassed handlers intact for an entire operation clearMaxLoopCount() Removes the limit for the number of times we allow this class to run getHandlerName() Get the name of the current handler. This can be set by using the constructor with the string parameter to improve performance getLoopCount(handlerName) return the current loop count incrementCheckLoopCount() Increment the loop count and check if we exceeded the max loop count. Silently exit if we have exceeded it.(Log to System.debug) isBypassed(handlerName) A handler is considered bypassed if it was bypassed, or all handlers have been bypassed isBypassed(handlerType) A handler is considered bypassed if it was bypassed, or all handlers have been bypassed run() Main method that will be called during execution See the sample trigger for the best way to set up your handler setBypass(handlerName, desiredValue) Set bypass status to a specific value. Eliminates the need to know the current bypass status setMaxLoopCount(max) Limit the number of times this handler can be run before it fails silently setTriggerContext() Base method called by constructor to set the current context setTriggerContext(opType, testMode) Set the current trigger context based on the System.TriggerOperation If we are not in a trigger context, then we set isTriggerExecuting to false showDebug() Called in the trigger to force the class to debug trigger entry and exit with context. showDebug(enabled) Called in the trigger to force the class to debug trigger entry and exit with context. Set to true to show entry and exit. showLimits() Called before the trigger to force the class to debug query limits when it runs showLimits(enabled) Called before the trigger to enable the class to debug(or not) query limits when it runs. Set to true to show limits. validateRun() Make sure this trigger should continue to run Returning false  causes trigger handler to exit afterDelete() Virtual method for the implementing class to override Signature protected virtual void afterDelete() afterInsert() Virtual method for the implementing class to override Signature protected virtual void afterInsert() afterUndelete() Virtual method for the implementing class to override Signature protected virtual void afterUndelete() afterUpdate() Virtual method for the implementing class to override Signature protected virtual void afterUpdate() beforeDelete() Virtual method for the implementing class to override Signature protected virtual void beforeDelete() beforeInsert() Virtual method for the implementing class to override Signature protected virtual void beforeInsert() beforeUpdate() Virtual method for the implementing class to override Signature protected virtual void beforeUpdate() bypass(handlerName) Bypass by string Signature public static void bypass(String handlerName) Parameters handlerName Type: String Name of the handler to be bypassed Example TriggerHandler.bypass('AccountSampleTriggerHandler') bypass(handlerType) Bypass by type/class. This is probably best for avoiding typos. Signature public static void bypass(Type handlerType) Parameters handlerType Type: Type The Class to be bypassed. Must end with \".class\" Author vr8hub Example TriggerHandler.bypass(AccountTriggerHandler.class); bypass(handlerNames) Bypass by list, e.g. TriggerHandler.bypass(listOfHandlerStrings) Signature public static void bypass(List<String> handlerNames) Parameters handlerNames Type: List<String> List of handlernames bypassAll() Bypass all handlers(clear bypassedHandlers to prevent confusion) Signature public static void bypassAll() Example TriggerHandler.bypassAll(); bypassList() Return a list of the bypassed handlers Though both Set and List allow contains(value), we include both methods for convenience Signature public static List<String> bypassList() Returns List<String>  List of bypassed handlers Example TriggerHandler.bypassList(); bypassSet() Return a Set of the bypassed handlers Though both Set and List allow contains(value), we include both methods for convenience Signature public static Set<String> bypassSet() Returns Set<String>  Set of bypassed handlers Since 2022 Example if(TriggerHandler.bypassSet().contains('AccountSampleTriggerHandler'){ // do something } clearAllBypasses() Clear all bypasses - by clearing the global bypass and by clearing the list of bypassed handlers Signature public static void clearAllBypasses() Example TriggerHandler.clearAllBypasses(); clearBypass(handlerName) Bypass a specific handler by name Signature public static void clearBypass(String handlerName) Parameters handlerName Type: String The class name to be bypassed Author vr8hub Example TriggerHandler.clearBypass('AccountSampleTriggerHandler') clearBypass(handlerType) Bypass a specific handler by type Signature public static void clearBypass(Type handlerType) Parameters handlerType Type: Type The class to be bypassed. Must end with \".class\" Example TriggerHandler.clearBypass(AccountSampleTriggerHandler.class) clearBypass(handlerNames) Bypass a list of handlers Signature public static void clearBypass(List<String> handlerNames) Parameters handlerNames Type: List<String> List of Strings of handlers to bypass Example List<String> classList = ['AccountTriggerHandler','ContactTriggerHandler']; TriggerHandler.clearBypass(classList); clearBypassList() Clear the entire bypass list, but keep the global bypass flag intact This is useful for resetting the list of handlers to bypass while maintaining global bypassing Signature public static void clearBypassList() Example TriggerHandler.clearBypassList(); clearGlobalBypass() Clear only the global bypass flag, leaving the list of bypassed handlers intact This is useful for keeping a base set of bypassed handlers intact for an entire operation Signature public static void clearGlobalBypass() Example TriggerHandler.clearGlobalBypass(); clearMaxLoopCount() Removes the limit for the number of times we allow this class to run Signature public void clearMaxLoopCount() getHandlerName() Get the name of the current handler. This can be set by using the constructor with the string parameter to improve performance Signature private String getHandlerName() Returns String  Name of the current handler See TriggerHandler.handlerName getLoopCount(handlerName) return the current loop count Signature public static Integer getLoopCount(String handlerName) Parameters handlerName Type: String The handler class to check for the current loop count Returns Integer  How many times has this handler run? incrementCheckLoopCount() Increment the loop count and check if we exceeded the max loop count. Silently exit if we have exceeded it.(Log to System.debug) Signature private Boolean incrementCheckLoopCount() Returns Boolean  Should the trigger continue execution? Author David Schach  fbouzeraa isBypassed(handlerName) A handler is considered bypassed if it was bypassed, or all handlers have been bypassed Signature public static Boolean isBypassed(String handlerName) Parameters handlerName Type: String The class name of the handler we are checking is bypassed Returns Boolean  Is this handler bypassed? Example TriggerHandler.isBypassed('AccountTriggerHandler'); isBypassed(handlerType) A handler is considered bypassed if it was bypassed, or all handlers have been bypassed Signature public static Boolean isBypassed(Type handlerType) Parameters handlerType Type: Type The handler class we are checking is bypassed Returns Boolean  Is this handler bypassed? Since 2021 Example TriggerHandler.isBypassed(AccountTriggerHandler.class); run() Main method that will be called during execution See the sample trigger for the best way to set up your handler Signature public void run() Author Kevin O'Hara David Schach Example new AccountSampleTriggerHandler().run(); setBypass(handlerName, desiredValue) Set bypass status to a specific value. Eliminates the need to know the current bypass status Signature public static void setBypass(String handlerName, Boolean desiredValue) Parameters handlerName Type: String The name of the TriggerHandler class desiredValue Type: Boolean true  to bypass, and false  to run the handler/clear the bypass Author David Schach Since 2021 Example TriggerHandler.setBypass('AccountTriggerHandler', false); -or- Boolean isBypassed = TriggerHandler.isBypassed('AccountTriggerHandler'); TriggerHandler.bypass('AccountTriggerHandler'); // do something here TriggerHandler.setBypass('AccountTriggerHandler', isBypassed); setMaxLoopCount(max) Limit the number of times this handler can be run before it fails silently Signature public void setMaxLoopCount(Integer max) Parameters max Type: Integer Naximum number of times Author David Schach Example TriggerHandler.setMaxLoopCount(5); setTriggerContext() Base method called by constructor to set the current context Signature private void setTriggerContext() setTriggerContext(opType, testMode) Set the current trigger context based on the System.TriggerOperation If we are not in a trigger context, then we set isTriggerExecuting to false Signature private void setTriggerContext(System.TriggerOperation opType, Boolean testMode) Parameters opType Type: System.TriggerOperation The operation type - set automatically by the system testMode Type: Boolean Only used in test methods to force certain contexts See TriggerHandler.isTriggerExecuting showDebug() Called in the trigger to force the class to debug trigger entry and exit with context. Signature public static void showDebug() See TriggerHandler.showLimits Author David Schach Since 2021 Example TriggerHandler.showDebug(); new AccountSampleTriggerHandler.run(); -or- AccountSampleTriggerHandler.showDebug(); showDebug(enabled) Called in the trigger to force the class to debug trigger entry and exit with context. Set to true to show entry and exit. Signature public static void showDebug(Boolean enabled) Parameters enabled Type: Boolean true to enable; false to disable See TriggerHandler.showDebug Author David Schach Since 2021 showLimits() Called before the trigger to force the class to debug query limits when it runs Signature public static void showLimits() See TriggerHandler.showLimits Example TriggerHandler.showLimits(); new AccountSampleTriggerHandler.run(); -or- AccountSampleTriggerHandler.showLimits(); showLimits(enabled) Called before the trigger to enable the class to debug(or not) query limits when it runs. Set to true to show limits. Signature public static void showLimits(Boolean enabled) Parameters enabled Type: Boolean true to enable; false to disable See TriggerHandler.showLimits validateRun() Make sure this trigger should continue to run Returning false  causes trigger handler to exit Signature private Boolean validateRun() Returns Boolean  Is the run valid? Exceptions TriggerHandlerException See TriggerHandler.TriggerHandlerException TriggerHandler.LoopCount Inner class for managing the loop count per handler Signature @TestVisible private class LoopCount TriggerHandler.LoopCount Properties Name Signature Description count private Integer count Number of times this handler has been run max private Integer max Maximum number of times this handler should be run TriggerHandler.LoopCount Constructors LoopCount() Standard constructor Default max to 5 Default count to 0 LoopCount(max) Constructor with specified max loops LoopCount() Standard constructor Default max to 5 Default count to 0 Signature public LoopCount() LoopCount(max) Constructor with specified max loops Signature public LoopCount(Integer max) Parameters max Type: Integer Max number of loops allowed TriggerHandler.LoopCount Methods exceeded() Determines if we're about to exceed the loop count. getCount() Returns the current loop count. getMax() Returns the max loop count. increment() Increment the internal counter returning the results of this.exceeded(). setMax(max) Sets the max loop count exceeded() Determines if we're about to exceed the loop count. Signature public Boolean exceeded() Returns Boolean  True if less than 0 or more than max. getCount() Returns the current loop count. Signature public Integer getCount() Returns Integer  Current loop count. getMax() Returns the max loop count. Signature public Integer getMax() Returns Integer  Max loop count. increment() Increment the internal counter returning the results of this.exceeded(). Signature public Boolean increment() Returns Boolean  true if count will exceed max count or is less than 0. setMax(max) Sets the max loop count Signature public void setMax(Integer max) Parameters max Type: Integer The integer to set max to. TriggerHandler.TriggerHandlerException Exception class Signature public class TriggerHandlerException extends Exception"
    },
    {
        "title": "TriggerHandlerTest",
        "fileName": "TriggerHandlerTest.html",
        "text": "TriggerHandlerTest Test class for base TriggerHandler class Signature @isTest private class TriggerHandlerTest See GitHub , TriggerHandler Kevin OHara  David Schach 2013 TriggerHandlerTest Properties Name Signature handler private static TriggerHandlerTest.TestHandler handler lastMethodCalled private static String lastMethodCalled TriggerHandlerTest Methods afterDeleteMode() afterInsertMode() afterUndeleteMode() afterUpdateMode() assertTestHandlerName() Ensure that the current handler name is as expected beforeDeleteMode() beforeInsertMode() beforeUpdateMode() resetTest() testAfterDelete() testAfterInsert() testAfterUndelete() testAfterUpdate() testBeforeDelete() testBeforeInsert() testBeforeInsertWithLimits() Test and show limits and debug testBeforeUpdate() testBypassAPI() test bypass api testBypassByType() Test bypass by Type testConstructorWithParameter() testConstructorWithParametersAndBypass() testLoopCount() instance method tests testLoopCountClass() testNonTriggerContext() testOutsideTrigger() call from outside trigger testVirtualMethods() test virtual methods afterDeleteMode() Signature private static void afterDeleteMode() afterInsertMode() Signature private static void afterInsertMode() afterUndeleteMode() Signature private static void afterUndeleteMode() afterUpdateMode() Signature private static void afterUpdateMode() assertTestHandlerName() Ensure that the current handler name is as expected Signature private static void assertTestHandlerName() beforeDeleteMode() Signature private static void beforeDeleteMode() beforeInsertMode() Signature private static void beforeInsertMode() beforeUpdateMode() Signature private static void beforeUpdateMode() resetTest() Signature private static void resetTest() testAfterDelete() Signature @isTest private static void testAfterDelete() testAfterInsert() Signature @isTest private static void testAfterInsert() testAfterUndelete() Signature @isTest private static void testAfterUndelete() testAfterUpdate() Signature @isTest private static void testAfterUpdate() testBeforeDelete() Signature @isTest private static void testBeforeDelete() testBeforeInsert() Signature @isTest private static void testBeforeInsert() testBeforeInsertWithLimits() Test and show limits and debug Signature @isTest private static void testBeforeInsertWithLimits() testBeforeUpdate() Signature @isTest private static void testBeforeUpdate() testBypassAPI() test bypass api Signature @isTest private static void testBypassAPI() testBypassByType() Test bypass by Type Signature @IsTest static void testBypassByType() testConstructorWithParameter() Signature @isTest private static void testConstructorWithParameter() testConstructorWithParametersAndBypass() Signature @isTest private static void testConstructorWithParametersAndBypass() testLoopCount() instance method tests Signature @isTest private static void testLoopCount() testLoopCountClass() Signature @isTest private static void testLoopCountClass() testNonTriggerContext() Signature @isTest private static void testNonTriggerContext() testOutsideTrigger() call from outside trigger Signature @isTest private static void testOutsideTrigger() testVirtualMethods() test virtual methods Signature @isTest private static void testVirtualMethods() TriggerHandlerTest.TestHandler test implementation of the TriggerHandler Signature private class TestHandler extends TriggerHandler TriggerHandlerTest.TestHandler Constructors TestHandler() Invoke constructor TestHandler(handlerName) Override the trigger handler constructor that takes the handler name as a parameter TestHandler() Invoke constructor Signature public TestHandler() TestHandler(handlerName) Override the trigger handler constructor that takes the handler name as a parameter Signature public TestHandler(String handlerName) Parameters handlerName Type: String The handler name to instantiate TriggerHandlerTest.TestHandler Methods afterDelete() afterInsert() afterUndelete() afterUpdate() beforeDelete() beforeInsert() beforeUpdate() afterDelete() Signature public override void afterDelete() afterInsert() Signature public override void afterInsert() afterUndelete() Signature public override void afterUndelete() afterUpdate() Signature public override void afterUpdate() beforeDelete() Signature public override void beforeDelete() beforeInsert() Signature public override void beforeInsert() beforeUpdate() Signature public override void beforeUpdate()"
    },
    {
        "title": "AccountSampleTriggerHandler",
        "fileName": "AccountSampleTriggerHandler.html",
        "text": "AccountSampleTriggerHandler Account Sample handler Signature public without sharing class AccountSampleTriggerHandler extends TriggerHandler David Schach2021 AccountSampleTriggerHandler Properties Name Signature newRecords private List<Account> newRecords newRecordsMap private Map<Id, Account> newRecordsMap oldRecords private List<Account> oldRecords oldRecordsMap private Map<Id, Account> oldRecordsMap AccountSampleTriggerHandler Constructors AccountSampleTriggerHandler(className) Constructor using passed-in class name constructor for faster performance We cast all four trigger collections AccountSampleTriggerHandler(className) Constructor using passed-in class name constructor for faster performance We cast all four trigger collections Signature public AccountSampleTriggerHandler(String className) Parameters className Type: String The name of this class. Pass in the string to make the handler run faster AccountSampleTriggerHandler Methods afterInsert() beforeInsert() beforeUpdate() method1() method2() method3() afterInsert() Signature public override void afterInsert() beforeInsert() Signature public override void beforeInsert() beforeUpdate() Signature public override void beforeUpdate() method1() Signature private void method1() method2() Signature private void method2() method3() Signature private void method3()"
    },
    {
        "title": "AccountSampleTriggerHandlerTest",
        "fileName": "AccountSampleTriggerHandlerTest.html",
        "text": "AccountSampleTriggerHandlerTest Account Sample handler Signature @IsTest private class AccountSampleTriggerHandlerTest David Schach2021 AccountSampleTriggerHandlerTest Methods insertUpdateAccount() Test method to demonstrate using our sample handler and showing limits and debug insertUpdateAccount() Test method to demonstrate using our sample handler and showing limits and debug Signature static void insertUpdateAccount() Author David Schach"
    }
];
