export default [
    {
        "title": "Home",
        "fileName": "index.html",
        "text": "Home  Salesforce Trigger Framework  Credit \tBased on Kevin O’Hara’s famous framework sfdc-trigger-framework   Overview \tTriggers should be logicless. Putting logic into your triggers creates un-testable, difficult-to-maintain code. It’s widely accepted that a best-practice is to move trigger logic\tinto a handler class. \tThis trigger framework bundles a single TriggerHandler  base class that you can inherit from in all of your trigger handlers. The base class includes\tcontext-specific methods that are automatically called when a trigger is executed. \tThe base class also provides a secondary role as a supervisor for Trigger execution. It acts like a watchdog, monitoring trigger activity and providing an api for controlling\tcertain aspects of execution and control flow. But the most important part of this framework is that it’s minimal and simple to use. Usage Trigger Handler \tTo create a trigger handler, you simply need to create a class that inherits from TriggerHandler . Here is an example for creating an Opportunity trigger handler. public class OpportunityTriggerHandler extends TriggerHandler {  \tIn your trigger handler, to add logic to any of the trigger contexts, you only need to override them in your trigger handler. Here is how we would add logic to a\tbeforeUpdate, afterUpdate  trigger. \tA sample AccountSampleTriggerHandler  class has been included\tin this repository, as well as a sample\ttrigger . \tNote:  When referencing the Trigger static maps within a class, SObjects are returned versus SObject subclasses like Opportunity, Account, etc. This means that\tyou must cast when you reference them in your trigger handler. You could do this in your constructor if you wanted. Technically, you only need to cast for oldMap and newMap, but\tfor completeness, I encourage casting Trigger.new and Trigger.old as well. public class OpportunityTriggerHandler extends TriggerHandler {  private List<Opportunity> newRecords;  private List<Opportunity> oldRecords;  private Map<Id, Opportunity> newRecordsMap;  private Map<Id, Opportunity> oldRecordsMap;  public OpportunityTriggerHandler(){    super('OpportunityTriggerHandler');    this.newRecords = Trigger.new;    this.oldRecords = Trigger.old;    this.newRecordsMap =(Map<Id, Opportunity>) Trigger.newMap;    this.oldRecordsMap =(Map<Id, Opportunity>) Trigger.oldMap;  }  public override void beforeUpdate() {    for(Opportunity o : newRecords) {      /* do something */    }  }  public override void afterUpdate() {      /* do something */  }  /* add overrides for other contexts */}  Trigger \tTo use the trigger handler, you only need to construct an instance of your trigger handler within the trigger handler itself and call the run()  method. Here is an\texample of an Opportunity trigger. \tThis is the way to write a trigger that will run the trigger handlers below. Note that some objects do not work in every context, so ensure that you list only applicable trigger\tcontexts in your trigger definition and that you only override those contexts. If you include extra contexts, they will not be covered by Apex tests, which could lead to\tdeployment problems. trigger OpportunityTrigger on Opportunity(before update, after update) {  new OpportunityTriggerHandler().run();}  Cool Stuff Bypass API What if you want to tell other trigger handlers to halt execution? That's easy with the bypass api: public class OpportunityTriggerHandler extends TriggerHandler {  private Map<Id, Opportunity> newRecordsMap;  /* Optional Constructor - better performance */  public OpportunityTriggerHandler(){    super('OpportunityTriggerHandler');    this.newRecordsMap =(Map<Id, Opportunity>) Trigger.newMap;  }  public override void afterUpdate() {    List<Opportunity> opps = [SELECT Id, AccountId FROM Opportunity WHERE Id IN :newRecordsMap.keySet()];    Account acc = [SELECT Id, Name FROM Account WHERE Id = :opps.get(0).AccountId];    TriggerHandler.bypass('AccountTriggerHandler');    acc.Name = 'No Trigger';    update acc; /* won't invoke the AccountTriggerHandler */    TriggerHandler.clearBypass('AccountTriggerHandler');    acc.Name = 'With Trigger';    update acc; /* will invoke the AccountTriggerHandler */  }}  Check Bypass Status If you need to check if a handler is bypassed, use the isBypassed  method: if(TriggerHandler.isBypassed('AccountTriggerHandler')) {  /* ... do something if the Account trigger handler is bypassed! */}  Global Bypass To bypass all handlers, set the global bypass variable: TriggerHandler.setGlobalBypass();  This will also add an entry 'bypassAll' to the list of handlers returned in bypassList . To clear all bypasses for the transaction, simply use the clearAllBypasses  method, as in: /* ... done with bypasses! */TriggerHandler.clearAllBypasses();/* ... now handlers won't be ignored! */  This will clear the list of bypassed handlers and set the globalBypass  Boolean to false. Set Bypass \tIf you are not sure in a transaction if a handler is bypassed, but want to bypass it(or clear the bypass) and then set it to its original value, use the\tsetBybass  method: Boolean isBypassed = TriggerHandler.isBypassed('AccountTriggerHandler');TriggerHandler.bypass('AccountTriggerHandler');/* do something here */TriggerHandler.setBypass('AccountTriggerHandler', isBypassed);  To store all currently bypassed handlers, temporarily bypass all handlers, and then restore the originally bypassed list: List<String> bypassedHandlers = TriggerHandler.bypassList();TriggerHandler.bypassAll();/* do something here */TriggerHandler.clearAllBypasses(); /* or TriggerHandler.clearGlobalBypass() */TriggerHandler.bypass(bypassedHandlers);  Max Loop Count \tTo prevent recursion, you can set a max loop count for Trigger Handler. If this max is exceeded, and exception will be thrown. A great use case is when you want to ensure that\tyour trigger runs once and only once within a single execution. Example: public class OpportunityTriggerHandler extends TriggerHandler {  private Map<Id, Opportunity> newRecordsMap;  public OpportunityTriggerHandler(){    /* Optional Constructor overload - better performance */    super('OpportunityTriggerHandler');    this.newRecordsMap =(Map<Id, Opportunity>) Trigger.newMap;    this.setMaxLoopCount(1);  }  public override void afterUpdate() {    List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE Id IN :newRecordsMap.keySet()];    update opps;  }}  Debug Statements There are two methods that will show additional information. showLimits()  will show Apex query and DML limits when the trigger handler has completed showDebug()  will show trigger entry and exit, but only during Apex testing. This is to ensure org performance. To use one or both of these, amend them to the trigger: new AccountSampleTriggerHandler().showLimits().showDebug().run();  Overridable Methods Here are all of the methods that you can override. All of the context possibilities are supported. \t\tbeforeInsert()  \tbeforeUpdate()  \tbeforeDelete()  \tafterInsert()  \tafterUpdate()  \tafterDelete()  \tafterUndelete()"
    },
    {
        "title": "triggerhandlerhome",
        "fileName": "triggerhandlerhome.html",
        "text": "TriggerHandler TriggerHandler General Theme Each object has a single trigger  Each trigger has a single handler  Bypass Documentation \thttps://github.com/dschach/salesforce-trigger-framework/blob/main/README.md Sample Trigger  \ttrigger AccountSampleTrigger on Account(before insert, after insert, before update, after update, before delete, after delete, after undelete) {\t    new AccountSampleTriggerHandler().run();\t} Sample Handler \t/**\t * @description A sample Account trigger handler, with some comments\t *\t * @author David Schach\t * @since 2021\t * @see AccountSampleTriggerHandlerTest\t */\tpublic without sharing class AccountSampleTriggerHandler extends TriggerHandler {\t\t    private List<Account> newRecords;\t    private List<Account> oldRecords;\t    private Map<Id, Account> newRecordsMap;\t    private Map<Id, Account> oldRecordsMap;\t\t    public AccountSampleTriggerHandler() {\t        super('AccountSampleTriggerHandler');\t        this.newRecords =(List<Account>)Trigger.new;\t        this.oldRecords =(List<Account>)Trigger.old;\t        this.newRecordsMap =(Map<Id, Account>)Trigger.newMap;\t        this.oldRecordsMap =(Map<Id, Account>)Trigger.oldMap;\t    }\t\t    public override void beforeInsert(){\t        method1();\t        method2();\t        TriggerHandler.clearAllBypass();\t    }\t\t    public override void beforeUpdate(){\t        method2();\t    }\t\t    //public override void beforeDelete(){}\t\t    public override void afterInsert(){\t        TriggerHandler.bypass('ContactTriggerHandler');\t        updateContacts();\t        TriggerHandler.clearBypass('ContactTriggerHandler');\t    }\t\t    public override void afterUpdate(){\t        TriggerHandler.bypass('CaseSampleTriggerHandler');\t        // do something\t        TriggerHandler.clearAllBypasses();\t    }\t\t    //public override void afterDelete(){}\t    //public override void afterUndelete(){}\t\t\t    //**************************************************\t    // All \"handler\" methods are here for easier reading and reuse \t    //**************************************************\t\t    private void method1(){\t        for(Account a : newRecords){\t            a.Name = a.Name.toUpperCase();\t        }\t    }\t\t    private void method2(){\t        for(Account a : newRecords){\t            a.Name = a.Name.toLowerCase();\t        }\t    }\t\t    /**\t    * Try to keep all updates on other objects in a single DML statement\t    * @author Author Name\t    */\t    private void updateContacts(){\t        List<Contact> acctContacts = [SELECT Id FROM Contact WHERE AccountId IN :newRecordsMap.keyset()];\t        update acctContacts;\t    }\t} Credits  \tThis trigger framework is from\t\thttps://github.com/dschach/sfdc-trigger-framework\t\twhich is based on Kevin O'Hara's framework\t\thttps://github.com/kevinohara80/sfdc-trigger-framework"
    },
    {
        "title": "TriggerHandler",
        "fileName": "TriggerHandler.html",
        "text": "TriggerHandler Trigger Handler virtual class as base for all trigger handlers Signature public virtual class TriggerHandler See License , GitHub Kevin O'Hara David Schach2013 TriggerHandler Properties Name Signature Description bypassedHandlers private static Set<String> bypassedHandlers All bypassed handlers errorOutsideTriggerContext private static String errorOutsideTriggerContext Error text - assumes English for debug logs globalBypass private static Boolean globalBypass true  if we bypass all triggers without checking the contents of bypassedHandlers handlerName private String handlerName The name of this handler. Set by getHandlerName() isTriggerExecuting private Boolean isTriggerExecuting Is this class executing in trigger context? loopCountMap private static Map<String, LoopCount> loopCountMap static map of handlerName , times run()  was invoked showDebug private static Boolean showDebug true  if we include a debug statement for trigger entry and exit showLimits private static Boolean showLimits true  if we include a debug statement for limits triggerEvent private System.TriggerOperation triggerEvent the current triggerEvent of the trigger, overridable in tests TriggerHandler Constructors TriggerHandler() Basic constructor TriggerHandler(handlerName) Constructor with handler name to improve performance TriggerHandler() Basic constructor Signature public TriggerHandler() TriggerHandler(handlerName) Constructor with handler name to improve performance Signature public TriggerHandler(String handlerName) Parameters handlerName Type: String The name of the handler Author David Schach TriggerHandler Methods addToLoopCount() increment the loop count afterDelete() Virtual method for the implementing class to override afterInsert() Virtual method for the implementing class to override afterUndelete() Virtual method for the implementing class to override afterUpdate() Virtual method for the implementing class to override beforeDelete() Virtual method for the implementing class to override beforeInsert() Virtual method for the implementing class to override beforeUpdate() Virtual method for the implementing class to override bypass(handlerName) bypass by string, e.g. TriggerHandler.bypass('AccountTriggerHandler') bypass(handlerNames) bypass by list, e.g. TriggerHandler.bypass(listOfHandlerStrings) bypassAll() bypass all handlers(clear bypassedHandlers to prevent confusion) bypassList() return a list of the bypassed handlers clearAllBypasses() clear all bypasses - by clearing the global bypass and by clearing the list of bypassed handlers clearBypass(handlerName) bypass a specific handler clearBypass(handlersNames) bypass a list of handlers clearBypassList() clear the entire bypass list, but keep the global bypass flag intact This is useful for resetting the list of handlers to bypass while maintaining global bypassing clearGlobalBypass() clear only the global bypass flag, leaving the list of bypassed handlers intact This is useful for keeping a base set of bypassed handlers intact for an entire operation clearMaxLoopCount() Removes the limit for the number of times we allow this class to run getHandlerName() Get the name of the current handler. This can be set by using the constructor with the string parameter to improve performance getLoopCount(handlerName) return the current loop count isBypassed(handlerName) a handler is considered bypassed if it was bypassed, or all handlers have been bypassed run() main method that will be called during execution  See the sample trigger for the best way to set up your handler setBypass(handlerName, desiredValue) Set bypass status to a specific value. Eliminates the need to know the current bypass status setMaxLoopCount(max) setMaxLoopCount description setTriggerContext() Base method called by constructor to set the current context setTriggerContext(opType, testMode) Set the current trigger context based on the System.TriggerOperation If we are not in a trigger context, then we set isTriggerExecuting to false showDebug() Called in the trigger to force the class to debug trigger entry and exit with context. This is only shown in Test context, to speed org performance showDebug(enabled) Called in the trigger to force the class to debug trigger entry and exit with context. Set to true to show entry and exit. This is only shown in Test context, to speed org performance showLimits() Called in the trigger to force the class to debug query limits when it runs showLimits(enabled) Called in the trigger to force the class to debug limits when it runs. Set to true to show limits. validateRun() Make sure this trigger should continue to run Returning false  causes trigger handler to exit addToLoopCount() increment the loop count Signature private void addToLoopCount() Exceptions TriggerHandlerException See TriggerHandler.TriggerHandlerException afterDelete() Virtual method for the implementing class to override Signature protected virtual void afterDelete() afterInsert() Virtual method for the implementing class to override Signature protected virtual void afterInsert() afterUndelete() Virtual method for the implementing class to override Signature protected virtual void afterUndelete() afterUpdate() Virtual method for the implementing class to override Signature protected virtual void afterUpdate() beforeDelete() Virtual method for the implementing class to override Signature protected virtual void beforeDelete() beforeInsert() Virtual method for the implementing class to override Signature protected virtual void beforeInsert() beforeUpdate() Virtual method for the implementing class to override Signature protected virtual void beforeUpdate() bypass(handlerName) bypass by string, e.g. TriggerHandler.bypass('AccountTriggerHandler') Signature public static void bypass(String handlerName) Parameters handlerName Type: String Name of the handler to be bypassed Example TriggerHandler.bypass('AccountSampleTriggerHandler') bypass(handlerNames) bypass by list, e.g. TriggerHandler.bypass(listOfHandlerStrings) Signature public static void bypass(List<String> handlerNames) Parameters handlerNames Type: List<String> List of handlernames bypassAll() bypass all handlers(clear bypassedHandlers to prevent confusion) Signature public static void bypassAll() bypassList() return a list of the bypassed handlers Signature public static List<String> bypassList() Returns List<String> Example TriggerHandler.bypassList(); clearAllBypasses() clear all bypasses - by clearing the global bypass and by clearing the list of bypassed handlers Signature public static void clearAllBypasses() Example TriggerHandler.clearAllBypasses(); clearBypass(handlerName) bypass a specific handler Signature public static void clearBypass(String handlerName) Parameters handlerName Type: String The class name to be bypassed Example TriggerHandler.clearBypass('AccountSampleTriggerHandler') clearBypass(handlersNames) bypass a list of handlers Signature public static void clearBypass(List<String> handlersNames) Parameters handlersNames Type: List<String> Example List<String> classList = ['AccountTriggerHandler','ContactTriggerHandler']; TriggerHandler.clearBypass(classList; clearBypassList() clear the entire bypass list, but keep the global bypass flag intact This is useful for resetting the list of handlers to bypass while maintaining global bypassing Signature public static void clearBypassList() Example TriggerHandler.clearBypassList(); clearGlobalBypass() clear only the global bypass flag, leaving the list of bypassed handlers intact This is useful for keeping a base set of bypassed handlers intact for an entire operation Signature public static void clearGlobalBypass() Example TriggerHandler.clearGlobalBypass(); clearMaxLoopCount() Removes the limit for the number of times we allow this class to run Signature public void clearMaxLoopCount() getHandlerName() Get the name of the current handler. This can be set by using the constructor with the string parameter to improve performance Signature private String getHandlerName() Returns String  handlerName See TriggerHandler.handlerName getLoopCount(handlerName) return the current loop count Signature public static Integer getLoopCount(String handlerName) Parameters handlerName Type: String The handler class to check for the current loop count Returns Integer isBypassed(handlerName) a handler is considered bypassed if it was bypassed, or all handlers have been bypassed Signature public static Boolean isBypassed(String handlerName) Parameters handlerName Type: String The class name of the handler we are checking is bypassed Returns Boolean  Is this handler bypassed? Example TriggerHandler.isBypassed('AccountTriggerHandler'); run() main method that will be called during execution  See the sample trigger for the best way to set up your handler Signature public void run() Author Kevin O'Hara, David Schach Example new AccountSampleTriggerHandler().run(); setBypass(handlerName, desiredValue) Set bypass status to a specific value. Eliminates the need to know the current bypass status Signature public static void setBypass(String handlerName, Boolean desiredValue) Parameters handlerName Type: String The name of the TriggerHandler class desiredValue Type: Boolean true  to bypass, and false  to run the handler Example TriggerHandler.setBypass('AccountTriggerHandler', false); setMaxLoopCount(max) setMaxLoopCount description Signature public void setMaxLoopCount(Integer max) Parameters max Type: Integer max description Author David Schach Example TriggerHandler.setMaxLoopCount(5); setTriggerContext() Base method called by constructor to set the current context Signature private void setTriggerContext() setTriggerContext(opType, testMode) Set the current trigger context based on the System.TriggerOperation If we are not in a trigger context, then we set isTriggerExecuting to false Signature private void setTriggerContext(System.TriggerOperation opType, Boolean testMode) Parameters opType Type: System.TriggerOperation The operation type - set automatically by the system testMode Type: Boolean Only used in test methods to force certain contexts See TriggerHandler.isTriggerExecuting showDebug() Called in the trigger to force the class to debug trigger entry and exit with context. This is only shown in Test context, to speed org performance Signature public static void showDebug() Example new AccountSampleTriggerHandler.showDebug().showLimits().run(); showDebug(enabled) Called in the trigger to force the class to debug trigger entry and exit with context. Set to true to show entry and exit. This is only shown in Test context, to speed org performance Signature public static void showDebug(Boolean enabled) Parameters enabled Type: Boolean true to enable; false to disable See TriggerHandler.showDebug showLimits() Called in the trigger to force the class to debug query limits when it runs Signature public static void showLimits() Example new AccountSampleTriggerHandler.showLimits().run(); showLimits(enabled) Called in the trigger to force the class to debug limits when it runs. Set to true to show limits. Signature public static void showLimits(Boolean enabled) Parameters enabled Type: Boolean true to enable; false to disable See TriggerHandler.showLimits validateRun() Make sure this trigger should continue to run Returning false  causes trigger handler to exit Signature private Boolean validateRun() Returns Boolean  is the run valid? Exceptions TriggerHandlerException See TriggerHandler.TriggerHandlerException TriggerHandler.LoopCount inner class for managing the loop count per handler Signature @TestVisible private class LoopCount TriggerHandler.LoopCount Properties Name Signature count private Integer count max private Integer max TriggerHandler.LoopCount Constructors LoopCount() Default loop count to 5 LoopCount(max) Constructor with specified max loops LoopCount() Default loop count to 5 Signature public LoopCount() LoopCount(max) Constructor with specified max loops Signature public LoopCount(Integer max) Parameters max Type: Integer Max number of loops allowed TriggerHandler.LoopCount Methods exceeded() Determines if we're about to exceed the loop count. getCount() Returns the current loop count. getMax() Returns the max loop count. increment() Increment the internal counter returning the results of this.exceeded(). setMax(max) Sets the max loop size exceeded() Determines if we're about to exceed the loop count. Signature public Boolean exceeded() Returns Boolean  true if less than 0 or more than max. getCount() Returns the current loop count. Signature public Integer getCount() Returns Integer  current loop count. getMax() Returns the max loop count. Signature public Integer getMax() Returns Integer  max loop count. increment() Increment the internal counter returning the results of this.exceeded(). Signature public Boolean increment() Returns Boolean  true if count will exceed max count or is less than 0. setMax(max) Sets the max loop size Signature public void setMax(Integer max) Parameters max Type: Integer The integer to set max to. TriggerHandler.TriggerHandlerException Exception class Signature public class TriggerHandlerException extends Exception"
    },
    {
        "title": "TriggerHandlerTest",
        "fileName": "TriggerHandlerTest.html",
        "text": "TriggerHandlerTest Test class for base TriggerHandler class Signature @isTest private class TriggerHandlerTest See GitHub Kevin O'Hara David Schach2013 TriggerHandlerTest Properties Name Signature handler private static TriggerHandlerTest.TestHandler handler lastMethodCalled private static String lastMethodCalled TriggerHandlerTest Methods afterDeleteMode() afterInsertMode() afterUndeleteMode() afterUpdateMode() assertTestHandlerName() ensure that the current handler name is as expected beforeDeleteMode() beforeInsertMode() beforeUpdateMode() resetTest() testAfterDelete() testAfterInsert() testAfterUndelete() testAfterUpdate() testBeforeDelete() testBeforeInsert() testBeforeInsertWithLimits() Test and show limits and debug testBeforeUpdate() testBypassAPI() test bypass api testConstructorWithParameter() testConstructorWithParametersAndBypass() testLoopCount() instance method tests testLoopCountClass() testNonTriggerContext() testOutsideTrigger() call from outside trigger testVirtualMethods() test virtual methods afterDeleteMode() Signature private static void afterDeleteMode() afterInsertMode() Signature private static void afterInsertMode() afterUndeleteMode() Signature private static void afterUndeleteMode() afterUpdateMode() Signature private static void afterUpdateMode() assertTestHandlerName() ensure that the current handler name is as expected Signature private static void assertTestHandlerName() beforeDeleteMode() Signature private static void beforeDeleteMode() beforeInsertMode() Signature private static void beforeInsertMode() beforeUpdateMode() Signature private static void beforeUpdateMode() resetTest() Signature private static void resetTest() testAfterDelete() Signature @isTest private static void testAfterDelete() testAfterInsert() Signature @isTest private static void testAfterInsert() testAfterUndelete() Signature @isTest private static void testAfterUndelete() testAfterUpdate() Signature @isTest private static void testAfterUpdate() testBeforeDelete() Signature @isTest private static void testBeforeDelete() testBeforeInsert() Signature @isTest private static void testBeforeInsert() testBeforeInsertWithLimits() Test and show limits and debug Signature @isTest private static void testBeforeInsertWithLimits() testBeforeUpdate() Signature @isTest private static void testBeforeUpdate() testBypassAPI() test bypass api Signature @isTest private static void testBypassAPI() testConstructorWithParameter() Signature @isTest private static void testConstructorWithParameter() testConstructorWithParametersAndBypass() Signature @isTest private static void testConstructorWithParametersAndBypass() testLoopCount() instance method tests Signature @isTest private static void testLoopCount() testLoopCountClass() Signature @isTest private static void testLoopCountClass() testNonTriggerContext() Signature @isTest private static void testNonTriggerContext() testOutsideTrigger() call from outside trigger Signature @isTest private static void testOutsideTrigger() testVirtualMethods() test virtual methods Signature @isTest private static void testVirtualMethods() TriggerHandlerTest.TestHandler test implementation of the TriggerHandler Signature private class TestHandler extends TriggerHandler TriggerHandlerTest.TestHandler Constructors TestHandler() Invoke constructor TestHandler(handlerName) Override the trigger handler constructor that takes the handler name as a parameter TestHandler() Invoke constructor Signature public TestHandler() TestHandler(handlerName) Override the trigger handler constructor that takes the handler name as a parameter Signature public TestHandler(String handlerName) Parameters handlerName Type: String The handler name to instantiate TriggerHandlerTest.TestHandler Methods afterDelete() afterInsert() afterUndelete() afterUpdate() beforeDelete() beforeInsert() beforeUpdate() afterDelete() Signature public override void afterDelete() afterInsert() Signature public override void afterInsert() afterUndelete() Signature public override void afterUndelete() afterUpdate() Signature public override void afterUpdate() beforeDelete() Signature public override void beforeDelete() beforeInsert() Signature public override void beforeInsert() beforeUpdate() Signature public override void beforeUpdate()"
    },
    {
        "title": "AccountSampleTriggerHandler",
        "fileName": "AccountSampleTriggerHandler.html",
        "text": "AccountSampleTriggerHandler Account Sample handler Signature public without sharing class AccountSampleTriggerHandler extends TriggerHandler David Schach2021 AccountSampleTriggerHandler Properties Name Signature newRecords private List<Account> newRecords newRecordsMap private Map<Id, Account> newRecordsMap oldRecords private List<Account> oldRecords oldRecordsMap private Map<Id, Account> oldRecordsMap AccountSampleTriggerHandler Constructors AccountSampleTriggerHandler() Constructor using super() method for faster performance We cast all four trigger collections AccountSampleTriggerHandler() Constructor using super() method for faster performance We cast all four trigger collections Signature public AccountSampleTriggerHandler() AccountSampleTriggerHandler Methods afterInsert() beforeInsert() beforeUpdate() method1() method2() method3() afterInsert() Signature public override void afterInsert() beforeInsert() Signature public override void beforeInsert() beforeUpdate() Signature public override void beforeUpdate() method1() Signature private void method1() method2() Signature private void method2() method3() Signature private void method3()"
    },
    {
        "title": "AccountSampleTriggerHandlerTest",
        "fileName": "AccountSampleTriggerHandlerTest.html",
        "text": "AccountSampleTriggerHandlerTest Account Sample handler Signature @IsTest private class AccountSampleTriggerHandlerTest David Schach2021 AccountSampleTriggerHandlerTest Methods insertUpdateAccount() insertUpdateAccount() Signature @IsTest static void insertUpdateAccount()"
    }
];
