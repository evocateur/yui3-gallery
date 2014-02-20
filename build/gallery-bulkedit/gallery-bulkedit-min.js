YUI.add("gallery-bulkedit",function(Y,NAME){"use strict";function BulkEditDataSource(){BulkEditDataSource.superclass.constructor.apply(this,arguments)}function fromDisplayIndex(e){var t=-1;for(var n=0;n<this._index.length;n++){var r=this._index[n];if(!removed_re.test(r)){t++;if(t===e)return n}}return!1}function adjustRequest(){var e=this._callback.request;this._callback.adjust={origStart:e.startIndex,origCount:e.resultCount};if(!this._index)return;var t=Math.min(e.startIndex,this._index.length),n=0;for(var r=0;r<t;r++){var i=this._index[r];inserted_re.test(i)||n++,removed_re.test(i)&&t++}e.startIndex=n,this._callback.adjust.indexStart=r;var s=0;while(r<this._index.length&&s<this._callback.adjust.origCount){var i=this._index[r];inserted_re.test(i)&&e.resultCount--,removed_re.test(i)?e.resultCount++:s++,r++}this._callback.adjust.indexEnd=r}function internalSuccess(e){if(!e.response||e.error||!Y.Lang.isArray(e.response.results)){internalFailure.apply(this,arguments);return}if(!Y.Lang.isUndefined(this._callback._tId)&&e.tId!==this._callback._tId)return;this._callback.response=e.response,checkFinished.call(this)}function internalFailure(e){e.tId===this._callback._tId&&(this._callback.error=e.error,this._callback.response=e.response,this.fire("response",this._callback))}function checkFinished(){if(this._generatingRequest||!this._callback.response)return;this._fields||(this._fields={},Y.Array.each(this.get("ds").schema.get("schema").resultFields,function(e){Y.Lang.isObject(e)&&(this._fields[e.key]=e)},this));var response={};Y.mix(response,this._callback.response),response.results=[],response=Y.clone(response,!0);var dataStartIndex=0;this.get("startIndexExpr")&&eval("dataStartIndex=this._callback.response"+this.get("startIndexExpr"));var startIndex=this._callback.request.startIndex-dataStartIndex;response.results=this._callback.response.results.slice(startIndex,startIndex+this._callback.request.resultCount);if(!this._index){this.get("totalRecordsReturnExpr")&&eval("response"+this.get("totalRecordsReturnExpr")+"="+this._callback.response.results.length),this._count=this.get("extractTotalRecords")(response),this._index=[];for(var i=0;i<this._count;i++)this._index.push(i)}else{var adjust=this._callback.adjust;for(var i=adjust.indexStart,k=0;i<adjust.indexEnd;i++,k++){var j=this._index[i];if(inserted_re.test(j)){var id=j.substr(inserted_prefix.length);response.results.splice(k,0,Y.clone(this._new[id],!0))}else removed_re.test(j)&&(response.results.splice(k,1),k--)}}var uniqueIdKey=this.get("uniqueIdKey");this._callback.request.out_of_band||(this._records=[],this._recordMap={},Y.Array.each(response.results,function(e){var t=Y.clone(e,!0);this._records.push(t),this._recordMap[t[uniqueIdKey]]=t},this)),Y.Array.each(response.results,function(e){var t=this._diff[e[uniqueIdKey]];t&&Y.mix(e,t,!0)},this),this._callback.response=response,this.fire("response",this._callback)}function BulkEditor(){BulkEditor.superclass.constructor.apply(this,arguments)}function switchPage(e){this.saveChanges();var t=this.get("paginator");t.setTotalRecords(e.totalRecords,!0),t.setStartIndex(e.recordOffset,!0),t.setRowsPerPage(e.rowsPerPage,!0),t.setPage(e.page,!0),this._updatePageStatus(),this.reload()}function multiselectMarkup(e,t){var n='<div class="{cont}{key}">{label}{msg}<div id="{id}-multiselect" class="checkbox-multiselect">{input}</div><select id="{id}" class="{field}{key}" multiple="multiple" style="display:none;">{options}</select></div>',r=this.getFieldId(t.record,t.key),i=Y.Lang.isArray(t.value);if(e=="autocompleteMultivalueInput"){var s=Y.Lang.sub('<input type="text" id="{id}-multivalue-input" />',{id:r});Y.later(0,this,function(){var e=Y.one("#"+r+"-multivalue-input");e.plug(Y.Plugin.AutoComplete,{resultFilters:"phraseMatch",resultHighlighter:"phraseMatch",source:Y.reduce(t.field.values,[],function(e,t){return e.push(t.text),e})}),e.plug(Y.Plugin.MultivalueInput,{values:Y.map(t.value,function(e){var n=Y.Array.findIndexOf(t.field.values,function(t){return e===t.value.toString()});return n>=0?t.field.values[n].text:""})}),e.mvi.on("valuesChange",function(){var t=e.mvi.get("values"),n=e.ancestor(".checkbox-multiselect").next("select");Y.each(Y.Node.getDOMNode(n).options,function(e){e.selected=Y.Array.indexOf(t,e.text)>=0})}),this._destroyOnRender(e)})}else if(e=="checkboxes"){var o='<p class="checkbox-multiselect-checkbox"><input type="checkbox" id="{id}-{value}" value="{value}" {checked} />&nbsp;<label for="{id}-{value}">{label}</label></p>',u='<td class="checkbox-multiselect-column">',a="</td>",s=Y.Array.reduce(t.field.values,"",function(e,n,s){var f=Y.Lang.sub(o,{id:r,value:n.value,checked:i&&Y.Array.indexOf(t.value,n.value.toString())>=0?'checked="checked"':"",label:BulkEditor.cleanHTML(n.text)});return s>0&&s%BulkEditor.checkbox_multiselect_column_height===0&&(f=a+u+f),e+f});s='<table class="checkbox-multiselect-container"><tr>'+u+s+a+"</tr></table>"}var f='<option value="{value}" {selected}>{text}</option>',l=Y.Array.reduce(t.field.values,"",function(e,n){return e+Y.Lang.sub(f,{value:n.value,text:BulkEditor.cleanHTML(n.text),selected:i&&Y.Array.indexOf(t.value,n.value.toString())>=0?'selected="selected"':""})}),c=t.field&&t.field.label?BulkEditor.labelMarkup.call(this,t):"";return Y.Lang.sub(n,{cont:BulkEditor.field_container_class+" "+BulkEditor.field_container_class_prefix,field:BulkEditor.field_class_prefix,key:t.key,id:r,label:c,input:s,options:l,yiv:t.field&&t.field.validation&&t.field.validation.css||"",msg:BulkEditor.error_msg_markup})}function handleCheckboxMultiselectClickOnCheckbox(e){var t=e.currentTarget,n=t.get("value"),r=t.ancestor(".checkbox-multiselect").next("select");Y.some(Y.Node.getDOMNode(r).options,function(e){if(e.value==n)return e.selected=t.get("checked"),!0})}function HTMLTableBulkEditor(){HTMLTableBulkEditor.superclass.constructor.apply(this,arguments)}function moveFocus(e){e.halt();var t=this.getRecordAndFieldKey(e.target);if(!t)return;var n=this.getRecordContainer(e.target);n&&e.keyCode==38?
n=n.previous():n&&(n=n.next());var r=n&&this.getRecordId(n);if(r){var i=this.getFieldElement(r,t.field_key);if(i){i.focus();try{i.select()}catch(s){}}}}BulkEditDataSource.NAME="bulkEditDataSource",BulkEditDataSource.ATTRS={ds:{writeOnce:!0},generateRequest:{validator:Y.Lang.isFunction,writeOnce:!0},uniqueIdKey:{validator:Y.Lang.isString,writeOnce:!0},generateUniqueId:{value:function(){return idCounter++,uniqueIdPrefix+idCounter},validator:Y.Lang.isFunction,writeOnce:!0},startIndexExpr:{validator:Y.Lang.isString,writeOnce:!0},totalRecordsReturnExpr:{validator:Y.Lang.isString,writeOnce:!0},extractTotalRecords:{validator:Y.Lang.isFunction,writeOnce:!0}};var uniqueIdPrefix="bulk-edit-new-id-",idCounter=0,inserted_prefix="be-ds-i:",inserted_re=/^be-ds-i:/,removed_prefix="be-ds-r:",removed_re=/^be-ds-r:/;BulkEditDataSource.comparator={string:function(e,t){return Y.Lang.trim(e.toString())===Y.Lang.trim(t.toString())},integer:function(e,t){return parseInt(e,10)===parseInt(t,10)},decimal:function(e,t){return parseFloat(e,10)===parseFloat(t,10)},"boolean":function(e,t){return e&&t||!e&&!t?!0:!1}},Y.extend(BulkEditDataSource,Y.DataSource.Local,{initializer:function(e){e.ds instanceof Y.DataSource.Local||Y.error("BulkEditDataSource requires DataSource"),e.generateRequest||Y.error("BulkEditDataSource requires generateRequest function"),e.uniqueIdKey||Y.error("BulkEditDataSource requires uniqueIdKey configuration"),e.extractTotalRecords||Y.error("BulkEditDataSource requires extractTotalRecords function"),this._index=null,this._count=0,this._new={},this._diff={}},_dataIsLocal:function(){return Y.Lang.isArray(this.get("ds").get("source"))},_flushCache:function(){var e=this.get("ds");e.cache&&Y.Lang.isFunction(e.cache.flush)&&e.cache.flush()},getRecordCount:function(){return this._count},getCurrentRecords:function(){return this._records},getCurrentRecordMap:function(){return this._recordMap},getValue:function(e,t){this._dataIsLocal()||Y.error("BulkEditDataSource.getValue() can only be called when using a local datasource");var n=fromDisplayIndex.call(this,e);if(n===!1)return!1;n=this._index[n];if(inserted_re.test(n))var r=n.substr(inserted_prefix.length),i=this._new[r];else var i=this.get("ds").get("source")[n],r=i[this.get("uniqueIdKey")];return this._diff[r]&&!Y.Lang.isUndefined(this._diff[r][t])?this._diff[r][t]:i[t]},getChanges:function(){return this._diff},getRemovedRecordIndexes:function(){var e=[];return Y.Array.each(this._index,function(t){removed_re.test(t)&&e.push(parseInt(t.substr(removed_prefix.length),10))}),e},insertRecord:function(e,t){this._count++;var n=String(this.get("generateUniqueId")());this._new[n]={},this._new[n][this.get("uniqueIdKey")]=n;var r=fromDisplayIndex.call(this,e);r===!1&&(r=this._index.length),this._index.splice(r,0,inserted_prefix+n);if(t&&!Y.Lang.isObject(t)){var i=t.toString();t=Y.clone(this._recordMap[i]||this._new[i],!0);var s=this._diff[i];t&&s&&Y.mix(t,s,!0)}if(t){var o=this.get("uniqueIdKey");Y.Object.each(t,function(e,t){t!=o&&this.updateValue(n,t,e)},this)}return n},removeRecord:function(e){var t=fromDisplayIndex.call(this,e);if(t===!1)return!1;this._count--;if(inserted_re.test(this._index[t])){var n=this._index[t].substr(inserted_prefix.length);delete this._new[n],this._index.splice(t,1)}else{if(this._dataIsLocal())var n=this.get("ds").get("source")[this._index[t]][this.get("uniqueIdKey")].toString();this._index[t]=removed_prefix+this._index[t]}return n&&delete this._diff[n],!0},updateValue:function(e,t,n){t==this.get("uniqueIdKey")&&Y.error("BulkEditDataSource.updateValue() does not allow changing the id for a record.  Use BulkEditDataSource.updateRecordId() instead."),e=e.toString();var r=this._recordMap[e];r&&this._getComparator(t)(Y.Lang.isValue(r[t])?r[t]:"",Y.Lang.isValue(n)?n:"")?this._diff[e]&&delete this._diff[e][t]:(this._diff[e]||(this._diff[e]={}),this._diff[e][t]=n)},_getComparator:function(e){var t=this._fields[e]&&this._fields[e].comparator||"string";return Y.Lang.isFunction(t)?t:BulkEditDataSource.comparator[t]?BulkEditDataSource.comparator[t]:BulkEditDataSource.comparator.string},mergeChanges:function(e){function t(t){if(t[this.get("uniqueIdKey")].toString()===e){var n=this._diff[e];return n&&(Y.mix(t,n,!0),delete this._diff[e]),!0}}this._dataIsLocal()||Y.error("BulkEditDataSource.mergeChanges() can only be called when using a local datasource"),e=e.toString();var n=!1;this._flushCache(),Y.Array.some(this.get("ds").get("source"),function(e){if(t.call(this,e))return n=!0,!0},this),n||Y.Object.some(this._new,function(e){if(t.call(this,e))return n=!0,!0},this)},killRecord:function(e){function t(t){if(t[this.get("uniqueIdKey")].toString()===e){var n={};this.recordIdToIndex(e,n);var r=this._index[n.internal_index];this._index.splice(n.internal_index,1);if(!inserted_re.test(r))for(var i=n.internal_index;i<this._index.length;i++){var s=this._index[i];removed_re.test(s)?this._index[i]=removed_prefix+(parseInt(s.substr(removed_prefix.length),10)-1):inserted_re.test(s)||this._index[i]--}return this._count--,delete this._diff[e],!0}}this._dataIsLocal()||Y.error("BulkEditDataSource.killRecord() can only be called when using a local datasource"),e=e.toString();var n=!1;this._flushCache();var r=this.get("ds").get("source");Y.Array.some(r,function(e,i){if(t.call(this,e))return r.splice(i,1),n=!0,!0},this),n||Y.Object.some(this._new,function(e,r){if(t.call(this,e))return delete this._new[r],n=!0,!0},this)},updateRecordId:function(e,t){function n(n){if(n[this.get("uniqueIdKey")].toString()===e){var r={};this.recordIdToIndex(e,r);var i=r.internal_index;return inserted_re.test(this._index[i])&&(this._index[i]=inserted_prefix+t),n[this.get("uniqueIdKey")]=t,this._diff[e]&&(this._diff[t]=this._diff[e],delete this._diff[e]),!0}}this._dataIsLocal()||Y.error("BulkEditDataSource.updateRecordId() can only be called when using a local datasource"),e=e.toString(),t=t.toString();var r=!1;this._flushCache(),Y.Array.some(this.get("ds").get("source"),function(e){if(n.call(this
,e))return r=!0,!0},this),r||Y.Object.some(this._new,function(e,i){if(n.call(this,e))return this._new[t]=e,delete this._new[i],r=!0,!0},this)},recordIdToIndex:function(e,t){this._dataIsLocal()||Y.error("BulkEditDataSource.recordIdToIndex() can only be called when using a local datasource"),e=e.toString();var n=this.get("ds").get("source"),r=0;for(var i=0;i<this._index.length;i++){var s=this._index[i],o=inserted_re.test(s),u=removed_re.test(s);if(o&&s.substr(inserted_prefix.length)===e||!o&&!u&&n[s][this.get("uniqueIdKey")].toString()===e)return t&&(t.internal_index=i),r;u||r++}return-1},_defRequestFn:function(e){this._callback=e,adjustRequest.call(this),this._generatingRequest=!0,this._callback._tId=this.get("ds").sendRequest({request:this.get("generateRequest")(this._callback.request),callback:{success:Y.bind(internalSuccess,this),failure:Y.bind(internalFailure,this)}}),this._generatingRequest=!1,checkFinished.call(this)}}),Y.BulkEditDataSource=BulkEditDataSource,Y.namespace("DataSource").BulkEdit=BulkEditDataSource,BulkEditor.NAME="bulkedit",BulkEditor.ATTRS={ds:{validator:function(e){return e instanceof BulkEditDataSource},writeOnce:!0},fields:{validator:Y.Lang.isObject,writeOnce:!0},paginator:{validator:function(e){return e instanceof Y.Paginator},writeOnce:!0},requestExtra:{value:{},validator:Y.Lang.isObject,writeOnce:!0},pingClass:{value:Y.ClassNameManager.getClassName(BulkEditor.NAME,"ping"),validator:Y.Lang.isString},pingTimeout:{value:2,validator:Y.Lang.isNumber}},BulkEditor.checkbox_multiselect_column_height=6;var default_page_size=1e9,id_prefix="bulk-editor",id_separator="__",id_regex=new RegExp("^"+id_prefix+id_separator+"(.+?)(?:"+id_separator+"(.+?))?$"),status_prefix="bulkedit-has",status_pattern=status_prefix+"([a-z]+)",status_re=new RegExp(Y.Node.class_re_prefix+status_pattern+Y.Node.class_re_suffix),record_status_prefix="bulkedit-hasrecord",record_status_pattern=record_status_prefix+"([a-z]+)",record_status_re=new RegExp(Y.Node.class_re_prefix+record_status_pattern+Y.Node.class_re_suffix),message_container_class=Y.ClassNameManager.getClassName(BulkEditor.NAME,"message-text"),perl_flags_regex=/^\(\?([a-z]+)\)/;BulkEditor.record_container_class=Y.ClassNameManager.getClassName(BulkEditor.NAME,"bd"),BulkEditor.record_msg_container_class=Y.ClassNameManager.getClassName(BulkEditor.NAME,"record-message-container"),BulkEditor.field_container_class=Y.ClassNameManager.getClassName(BulkEditor.NAME,"field-container"),BulkEditor.field_container_class_prefix=BulkEditor.field_container_class+"-",BulkEditor.field_class_prefix=Y.ClassNameManager.getClassName(BulkEditor.NAME,"field")+"-",Y.extend(BulkEditor,Y.Widget,{initializer:function(e){e.paginator&&e.paginator.on("changeRequest",switchPage,this),this._hopper=[]},renderUI:function(){this.clearServerErrors(),this.reload()},bindUI:function(){this._attachEvents(this.get("contentBox"))},_attachEvents:function(e){Y.delegate("bulkeditor|click",handleCheckboxMultiselectClickOnCheckbox,e,".checkbox-multiselect input[type=checkbox]",this)},_destroyOnRender:function(e){this._hopper.push(e)},reload:function(){this.busy||this.plug(Y.Plugin.BusyOverlay),this.busy.show();var e=this.get("paginator"),t={startIndex:e?e.getStartIndex():0,resultCount:e?e.getRowsPerPage():default_page_size};Y.mix(t,this.get("requestExtra"));var n=this.get("ds");n.sendRequest({request:t,callback:{success:Y.bind(function(t){this.busy.hide();var r=n.getRecordCount();if(r>0&&e&&e.getStartIndex()>=r){e.setPage(e.getPreviousPage());return}this._render(t.response),this._updatePaginator(t.response),this.scroll_to_index=-1},this),failure:Y.bind(function(){this.busy.hide(),this.scroll_to_index=-1},this)}})},saveChanges:function(){var e=this.get("ds"),t=e.getCurrentRecords(),n=e.get("uniqueIdKey");Y.Object.each(this.get("fields"),function(r,i){Y.Array.each(t,function(t){var s=this.getFieldElement(t,i),o=s.get("tagName"),u;o=="INPUT"&&s.get("type").toLowerCase()=="checkbox"?u=s.get("checked")?r.values.on:r.values.off:o=="SELECT"&&s.get("multiple")?u=Y.reduce(Y.Node.getDOMNode(s).options,[],function(e,t){return t.selected&&e.push(t.value),e}):u=s.get("value"),e.updateValue(t[n],i,u)},this)},this)},getAllValues:function(e){var t={startIndex:0,resultCount:this.get("ds").getRecordCount(),out_of_band:!0};Y.mix(t,this.get("requestExtra")),this.get("ds").sendRequest({request:t,callback:e})},getChanges:function(){return this.get("ds").getChanges()},insertRecord:function(e,t){var n=this.get("ds").insertRecord(e,t);return e<=this.server_errors.records.length&&(this.server_errors.records.splice(e,0,{id:n}),this._updatePageStatus()),n},removeRecord:function(e){if(this.get("ds").removeRecord(e)){if(e<this.server_errors.records.length){var t=this.server_errors.records[e];this.server_errors.records.splice(e,1),delete this.server_errors.record_map[t[this.get("ds").get("uniqueIdKey")]],this._updatePageStatus()}return!0}return!1},getFieldConfig:function(e){return this.get("fields")[e]||{}},getRecordContainerId:function(e){return Y.Lang.isString(e)?id_prefix+id_separator+e:id_prefix+id_separator+e[this.get("ds").get("uniqueIdKey")]},getFieldId:function(e,t){return this.getRecordContainerId(e)+id_separator+t},getRecordAndFieldKey:function(e){var t=id_regex.exec(Y.Lang.isString(e)?e:e.get("id"));if(t&&t.length>0)return{record:this.get("ds").getCurrentRecordMap()[t[1]],field_key:t[2]}},getRecordId:function(e){if(Y.Lang.isObject(e)&&!e._node)return e[this.get("ds").get("uniqueIdKey")];var t=e.getAncestorByClassName(BulkEditor.record_container_class,!0);if(t){var n=id_regex.exec(t.get("id"));if(n&&n.length>0)return n[1]}},getRecordContainer:function(e){if(Y.Lang.isString(e))var t=id_prefix+id_separator+e;else{if(e&&e._node)return e.getAncestorByClassName(BulkEditor.record_container_class,!0);var t=this.getRecordContainerId(e)}return Y.one("#"+t)},getFieldContainer:function(e,t){var n=this.getFieldElement(e,t);return n.getAncestorByClassName(BulkEditor.field_container_class,!0)},getFieldElement:function(e,t
){return e&&e._node&&(e=this.getRecordId(e)),Y.one("#"+this.getFieldId(e,t))},showRecordIndex:function(e){if(e<0||this.get("ds").getRecordCount()<=e)return;var t=this.get("paginator"),n=t?t.getStartIndex():0,r=t?t.getRowsPerPage():default_page_size;if(n<=e&&e<n+r){var i=this.getRecordContainer(this.get("ds").getCurrentRecords()[e-n]);i.scrollIntoView(),this.pingRecord(i)}else t&&(this.scroll_to_index=e,t.setPage(1+Math.floor(e/r)))},showRecordId:function(e){var t=this.get("ds").recordIdToIndex(e);t>=0&&this.showRecordIndex(t)},pingRecord:function(e){var t=this.get("pingClass");if(t){var n=this.getRecordContainer(e);n.addClass(t),Y.later(this.get("pingTimeout")*1e3,null,function(){n.removeClass(t)})}},_render:function(e){Y.Chipper.destroy(this._hopper),this._hopper=[];var t=this.get("contentBox");this._renderContainer(t),t.set("scrollTop",0),t.set("scrollLeft",0),Y.Array.each(e.results,function(e){var n=this._renderRecordContainer(t,e);this._renderRecord(n,e)},this),this.fire("pageRendered"),this.auto_validate&&this.validate(),this.scroll_to_index>=0&&(this.showRecordIndex(this.scroll_to_index),this.scroll_to_index=-1)},_renderContainer:function(e){e.set("innerHTML","")},_renderRecordContainer:function(e,t){return null},_renderRecord:function(e,t){Y.Object.each(this.get("fields"),function(n,r){this._renderField({container:e,key:r,value:t[r],field:n,record:t})},this)},_renderField:function(e){},_updatePaginator:function(e){var t=this.get("paginator");t&&t.setTotalRecords(this.get("ds").getRecordCount(),!0)},clearServerErrors:function(){this.server_errors&&this.server_errors.page&&this.server_errors.page.length&&this.fire("clearErrorNotification"),this.server_errors={page:[],records:[],record_map:{}};var e=this.get("paginator");e&&e.set("pageStatus",[]),this.first_error_page=-1,this._clearValidationMessages()},setServerErrors:function(e,t){this.server_errors.page.length&&(!e||!e.length)&&this.fire("clearErrorNotification"),this.server_errors={page:e||[],records:t||[],record_map:Y.Array.toObject(t||[],"id")},this._updatePageStatus();var n=this.get("paginator");!n||n.getCurrentPage()===this.first_error_page?this.validate():(this.auto_validate=!0,n.setPage(this.first_error_page))},_updatePageStatus:function(){var e=this.get("paginator");if(!e)return;var t=e?e.getRowsPerPage():default_page_size,n=this.page_status.slice(0);this.first_error_page=-1;var r=this.server_errors.records;for(var i=0;i<r.length;i++)if(r[i].recordError||r[i].fieldErrors){var s=Math.floor(i/t);n[s]="error",this.first_error_page==-1&&(this.first_error_page=s+1)}e.set("pageStatus",n)},validate:function(){this.saveChanges(),this._clearValidationMessages(),this.auto_validate=!0;var e=this._validateVisibleFields(),t=this.get("paginator");!e&&t&&(this.page_status[t.getCurrentPage()-1]="error"),e=this._validateAllPages()&&e;if(!e||this.server_errors.page.length||this.server_errors.records.length){var n=this.server_errors.page.slice(0);n.length===0&&n.push(Y.FormManager.Strings.validation_error),this.fire("notifyErrors",{msgs:n}),this.get("contentBox").getElementsByClassName(BulkEditor.record_container_class).some(function(e){if(e.hasClass(status_pattern))return e.scrollIntoView(),!0})}return this._updatePageStatus(),e},_validateVisibleFields:function(e){var t=!0;e||(e=this.get("contentBox"));var n=e.getElementsByTagName("input"),r=e.getElementsByTagName("textarea"),i=e.getElementsByTagName("select");return Y.FormManager.cleanValues(n),Y.FormManager.cleanValues(r),t=this._validateElements(n)&&t,t=this._validateElements(r)&&t,t=this._validateElements(i)&&t,e.getElementsByClassName(BulkEditor.record_container_class).each(function(e){var n=this.getRecordId(e),r=this.server_errors.record_map[n];if(r&&r.recordError){r=r.recordError;if(Y.Lang.isString(r))var i=r,s="error";else var i=r.msg,s=r.type;this.displayRecordMessage(n,i,s,!1),t=t&&s!="error"&&s!="warn"}},this),t},_validateElements:function(e){var t=!0;return e.each(function(e){var n=this.getRecordAndFieldKey(e);if(!n)return;var r=this.getFieldConfig(n.field_key),i=r.validation&&r.validation.msg,s=Y.FormManager.validateFromCSSData(e,i);if(s.error){this.displayFieldMessage(e,s.error,"error",!1),t=!1;return}if(s.keepGoing){if(r.validation&&Y.Lang.isString(r.validation.regex)){var o="",u=perl_flags_regex.exec(r.validation.regex);u&&u.length==2&&(o=u[1],r.validation.regex=r.validation.regex.replace(perl_flags_regex,"")),r.validation.regex=new RegExp(r.validation.regex,o)}if(r.validation&&r.validation.regex instanceof RegExp&&!r.validation.regex.test(e.get("value"))){this.displayFieldMessage(e,i&&i.regex,"error",!1),t=!1;return}}if(r.validation&&Y.Lang.isFunction(r.validation.fn)&&!r.validation.fn.call(this,e)){t=!1;return}var a=this.server_errors.record_map[this.getRecordId(n.record)];if(a&&a.fieldErrors){var f=a.fieldErrors[n.field_key];if(f){if(Y.Lang.isString(f))var l=f,c="error";else var l=f.msg,c=f.type;this.displayFieldMessage(e,l,c,!1),t=t&&c!="error"&&c!="warn";return}}},this),t},_validateAllPages:function(){var e=this.get("ds"),t=this.get("paginator");if(!t||!e._dataIsLocal())return!0;this.validation_node||(this.validation_node=Y.Node.create("<input></input>")),this.validation_keys||(this.validation_keys=[],Y.Object.each(this.get("fields"),function(e,t){e.validation&&this.validation_keys.push(t)},this));var n=e.getRecordCount(),r=t.getRowsPerPage(),i=!0;for(var s=0;s<n;s++){var o=!0;Y.Array.each(this.validation_keys,function(t){var n=this.get("fields")[t],r=e.getValue(s,t);this.validation_node.set("value",Y.Lang.isUndefined(r)?"":r),this.validation_node.set("className",n.validation.css||"");var i=Y.FormManager.validateFromCSSData(this.validation_node);if(i.error){o=!1;return}if(i.keepGoing&&n.validation.regex instanceof RegExp&&!n.validation.regex.test(r)){o=!1;return}},this);if(!o){var u=Math.floor(s/r);s=(u+1)*r-1,this.page_status[u]="error",i=!1}}return i},_clearValidationMessages:function(){this.has_validation_messages=!1,this.auto_validate=!1,this.page_status=[],this.fire
("clearErrorNotification");var e=this.get("contentBox");e.getElementsByClassName(status_pattern).removeClass(status_pattern),e.getElementsByClassName(record_status_pattern).removeClass(record_status_pattern),e.getElementsByClassName(message_container_class).set("innerHTML","")},displayFieldMessage:function(e,t,n,r){Y.Lang.isUndefined(r)&&(r=!this.has_validation_messages);var i=this.getRecordContainer(e),s=this._updateRecordStatus(i,n,status_pattern,status_re,status_prefix),o=e.getAncestorByClassName(BulkEditor.field_container_class);if(Y.FormManager.statusTakesPrecedence(this._getElementStatus(o,status_re),n)){if(t){var u=o.getElementsByClassName(message_container_class);u&&u.size()>0&&u.item(0).set("innerHTML",t)}o.replaceClass(status_pattern,status_prefix+n),this.has_validation_messages=!0}s&&r&&i.scrollIntoView()},displayRecordMessage:function(e,t,n,r){Y.Lang.isUndefined(r)&&(r=!this.has_validation_messages);var i=this.getRecordContainer(e),s=this._updateRecordStatus(i,n,status_pattern,status_re,status_prefix);if(this._updateRecordStatus(i,n,record_status_pattern,record_status_re,record_status_prefix)&&t){var o=i.getElementsByClassName(BulkEditor.record_msg_container_class).item(0);if(o){var u=o.getElementsByClassName(message_container_class);u&&u.size()>0&&u.item(0).set("innerHTML",t)}}s&&r&&i.scrollIntoView()},_getElementStatus:function(e,t){var n=t.exec(e.get("className"));return n&&n.length>1?n[1]:!1},_updateRecordStatus:function(e,t,n,r,i){return Y.FormManager.statusTakesPrecedence(this._getElementStatus(e,r),t)?(e.replaceClass(n,i+t),this.has_validation_messages=!0,!0):!1}}),BulkEditor.cleanHTML=function(e){return Y.Lang.isValue(e)?Y.Escape.html(e):""},BulkEditor.error_msg_markup=Y.Lang.sub('<div class="{c}"></div>',{c:message_container_class}),BulkEditor.labelMarkup=function(e){var t='<label for="{id}">{label}</label>';return Y.Lang.sub(t,{id:this.getFieldId(e.record,e.key),label:e.field.label})},BulkEditor.markup={input:function(e){var t='<div class="{cont}{key}">{label}{msg1}<input type="text" id="{id}" value="{value}" class="{field}{key} {yiv}" />{msg2}</div>',n=e.field&&e.field.label?BulkEditor.labelMarkup.call(this,e):"";return Y.Lang.sub(t,{cont:BulkEditor.field_container_class+" "+BulkEditor.field_container_class_prefix,field:BulkEditor.field_class_prefix,key:e.key,id:this.getFieldId(e.record,e.key),label:n,value:BulkEditor.cleanHTML(e.value),yiv:e.field&&e.field.validation&&e.field.validation.css||"",msg1:n?BulkEditor.error_msg_markup:"",msg2:n?"":BulkEditor.error_msg_markup})},select:function(e){var t='<div class="{cont}{key}">{label}{msg1}<select id="{id}" class="{field}{key}">{options}</select>{msg2}</div>',n='<option value="{value}" {selected}>{text}</option>',r=Y.Array.reduce(e.field.values,"",function(t,r){return t+Y.Lang.sub(n,{value:r.value,text:BulkEditor.cleanHTML(r.text),selected:e.value&&e.value.toString()===r.value?'selected="selected"':""})}),i=e.field&&e.field.label?BulkEditor.labelMarkup.call(this,e):"";return Y.Lang.sub(t,{cont:BulkEditor.field_container_class+" "+BulkEditor.field_container_class_prefix,field:BulkEditor.field_class_prefix,key:e.key,id:this.getFieldId(e.record,e.key),label:i,options:r,yiv:e.field&&e.field.validation&&e.field.validation.css||"",msg1:i?BulkEditor.error_msg_markup:"",msg2:i?"":BulkEditor.error_msg_markup})},checkbox:function(e){var t='<div class="{cont}{key}"><input type="checkbox" id="{id}" {value} class="{field}{key}" /> {label}{msg}</div>',n=e.field&&e.field.label?BulkEditor.labelMarkup.call(this,e):"";return Y.Lang.sub(t,{cont:BulkEditor.field_container_class+" "+BulkEditor.field_container_class_prefix,field:BulkEditor.field_class_prefix,key:e.key,id:this.getFieldId(e.record,e.key),label:n,value:e.value==e.field.values.on?'checked="checked"':"",msg:BulkEditor.error_msg_markup})},checkboxMultiselect:function(e){return multiselectMarkup.call(this,"checkboxes",e)},autocompleteInputMultiselect:function(e){return multiselectMarkup.call(this,"autocompleteMultivalueInput",e)},textarea:function(e){var t='<div class="{cont}{key}">{label}{msg1}<textarea id="{id}" class="satg-textarea-field {prefix}{key} {yiv}">{value}</textarea>{msg2}</div>',n=e.field&&e.field.label?BulkEditor.labelMarkup.call(this,e):"";return Y.Lang.sub(t,{cont:BulkEditor.field_container_class+" "+BulkEditor.field_container_class_prefix,prefix:BulkEditor.field_class_prefix,key:e.key,id:this.getFieldId(e.record,e.key),label:n,value:BulkEditor.cleanHTML(e.value),yiv:e.field&&e.field.validation&&e.field.validation.css||"",msg1:n?BulkEditor.error_msg_markup:"",msg2:n?"":BulkEditor.error_msg_markup})}},BulkEditor.fieldMarkup=function(e,t){var n=this.getFieldConfig(e);return BulkEditor.markup[n.type||"input"].call(this,{key:e,value:t[e],field:n,record:t})},Y.BulkEditor=BulkEditor,HTMLTableBulkEditor.NAME="htmltablebulkedit",HTMLTableBulkEditor.ATTRS={columns:{validator:Y.Lang.isObject,writeOnce:!0},events:{validator:Y.Lang.isObject,writeOnce:!0}};var cell_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"cell"),cell_class_prefix=cell_class+"-",odd_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"odd"),even_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"even"),msg_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"record-message"),liner_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"liner"),input_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"input"),textarea_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"textarea"),select_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"select"),checkbox_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"checkbox"),cb_multiselect_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"checkbox-multiselect"),cb_multi_input_class=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"input-multiselect");HTMLTableBulkEditor.inputFormatter=function(e){e.cell.set("innerHTML",BulkEditor.markup.
input.call(this,e)),e.cell.addClass(input_class)},HTMLTableBulkEditor.textareaFormatter=function(e){e.cell.set("innerHTML",BulkEditor.markup.textarea.call(this,e)),e.cell.addClass(textarea_class)},HTMLTableBulkEditor.selectFormatter=function(e){e.cell.set("innerHTML",BulkEditor.markup.select.call(this,e)),e.cell.addClass(select_class)},HTMLTableBulkEditor.checkboxFormatter=function(e){e.cell.set("innerHTML",BulkEditor.markup.checkbox.call(this,e)),e.cell.addClass(checkbox_class)},HTMLTableBulkEditor.checkboxMultiselectFormatter=function(e){e.cell.set("innerHTML",BulkEditor.markup.checkboxMultiselect.call(this,e)),e.cell.addClass(cb_multiselect_class)},HTMLTableBulkEditor.autocompleteInputMultiselectFormatter=function(e){e.cell.set("innerHTML",BulkEditor.markup.autocompleteInputMultiselect.call(this,e)),e.cell.addClass(cb_multi_input_class)},HTMLTableBulkEditor.defaults={input:{formatter:HTMLTableBulkEditor.inputFormatter},select:{formatter:HTMLTableBulkEditor.selectFormatter},checkbox:{formatter:HTMLTableBulkEditor.checkboxFormatter},checkboxMultiselect:{formatter:HTMLTableBulkEditor.checkboxMultiselectFormatter},autocompleteInputMultiselect:{formatter:HTMLTableBulkEditor.autocompleteInputMultiselectFormatter},textarea:{formatter:HTMLTableBulkEditor.textareaFormatter}},Y.extend(HTMLTableBulkEditor,BulkEditor,{bindUI:function(){},_renderContainer:function(e){var t=Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME);if(!this.table||e.get("firstChild").get("tagName")!="TABLE"||!e.get("firstChild").hasClass(t)){var n=Y.Lang.sub('<table class="{t}"><thead class="{hd}"><tr>',{t:t,hd:Y.ClassNameManager.getClassName(HTMLTableBulkEditor.NAME,"hd")}),r='<th class="{cell} {prefix}{key}">{label}</th>';n=Y.Array.reduce(this.get("columns"),n,function(e,t){return e+Y.Lang.sub(r,{cell:cell_class,prefix:cell_class_prefix,key:t.key,label:t.label||"&nbsp;"})}),n+="</tr></thead></table>",e.set("innerHTML",n),this.table=e.get("firstChild"),this._attachEvents(this.table),Y.on("key",moveFocus,this.table,"down:38,40+ctrl",this),Y.Object.each(this.get("events"),function(e){Y.delegate(e.type,e.fn,this.table,e.nodes,this)},this)}else while(this.table.get("children").size()>1)this.table.get("lastChild").remove().destroy(!0)},_renderRecordContainer:function(e,t){var n=Y.Node.create("<tbody></tbody>");n.set("id",this.getRecordContainerId(t)),n.set("className",BulkEditor.record_container_class+" "+(this.table.get("children").size()%2?odd_class:even_class));var r=Y.Node.create("<tr></tr>");r.set("className",BulkEditor.record_msg_container_class);var i=Y.Node.create("<td></td>");i.set("colSpan",this.get("columns").length),i.set("className",msg_class),i.set("innerHTML",BulkEditor.error_msg_markup),r.appendChild(i),n.appendChild(r);var s=Y.Node.create("<tr></tr>");return n.appendChild(s),this.table.appendChild(n),s},_renderRecord:function(e,t){Y.Array.each(this.get("columns"),function(n){var r=n.key,i=this.getFieldConfig(r),s=Y.Node.create("<td></td>");s.set("className",cell_class+" "+cell_class_prefix+r);var o=Y.Node.create("<div></div>");o.set("className",liner_class);var u=null;Y.Lang.isFunction(n.formatter)?u=n.formatter:i.type&&HTMLTableBulkEditor.defaults[i.type]?u=HTMLTableBulkEditor.defaults[i.type].formatter:(i.type,u=HTMLTableBulkEditor.defaults.input.formatter),u&&u.call(this,{cell:o,key:r,value:t[r],field:i,column:n,record:t}),s.appendChild(o),e.appendChild(s)},this)}}),Y.HTMLTableBulkEditor=HTMLTableBulkEditor},"gallery-2014.02.20-06-27",{skinnable:"true",requires:["widget","datasource-local","gallery-busyoverlay","gallery-formmgr-css-validation","gallery-node-optimizations","gallery-scrollintoview","array-extras","gallery-funcprog","escape","event-key","gallery-nodelist-extras2","gallery-chipper"],optional:["datasource","dataschema","gallery-paginator","autocomplete","autocomplete-filters","autocomplete-highlighters","gallery-multivalue-input"]});
